const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const router = express.Router();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

require('dotenv').config();
// SQL Server config
const dbConfig = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER,
  database: process.env.SQL_DATABASE,
  options: {
    encrypt: false, // for local dev
    trustServerCertificate: true,
  },
};

app.post("/api/auth/login", async (req, res) => {
  const { username, phone_number } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("username", sql.VarChar, username)
      .input("phone_number", sql.VarChar, phone_number).query(`
        SELECT * FROM auth_Table
        WHERE username = @username AND phone_number = @phone_number
      `);

    if (result.recordset.length === 1) {
      const user = result.recordset[0];
      res.json({
        success: true,
        user: {
          username: user.username,
          role: user.role,
          phone_number: user.phone_number,
        },
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all parking places
app.get("/parkingplace", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .query("SELECT place_id, place_name FROM place_Table");
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server error" });
  }
});

// Get slots for a specific place
app.get("/parkingSlot", async (req, res) => {
  try {
    const { placeId } = req.query;
    const pool = await sql.connect(dbConfig);

    const result = await pool
      .request()
      .input("placeId", sql.Int, parseInt(placeId)).query(`
        SELECT slot_id, slot_name, availability 
        FROM slot_Table 
        WHERE place_id = @placeId
      `);

    res.json(result.recordset);
  } catch (error) {
    console.error("Error in /parkingSlot route:", error);
    res.status(500).json({ error: "internal server error" });
  }
});

// Book a parking slot
app.post("/bookSlot", async (req, res) => {
  try {
    const {
      user_name,
      user_number,
      car_number,
      slot_id,
      entry_time,
      exit_time,
    } = req.body;

    // Ensure consistent timezone by parsing dates
    const parsedEntry = new Date(entry_time);
    const parsedExit = new Date(exit_time);

    const pool = await sql.connect(dbConfig);

    // 1. Check for overlapping bookings
    const check = await pool
      .request()
      .input("slot_id", sql.Int, slot_id)
      .input("entry_time", sql.DateTime, parsedEntry)
      .input("exit_time", sql.DateTime, parsedExit).query(`
        SELECT * FROM user_Table
        WHERE slot_id = @slot_id
          AND (
            (@entry_time BETWEEN entry_time AND exit_time)
            OR (@exit_time BETWEEN entry_time AND exit_time)
            OR (entry_time BETWEEN @entry_time AND @exit_time)
          )
      `);

    if (check.recordset.length > 0) {
      return res
        .status(400)
        .json({ message: "Slot already booked for this time." });
    }

    // 2. Insert booking details into user_Table
    await pool
      .request()
      .input("user_name", sql.NVarChar, user_name)
      .input("user_number", sql.NVarChar, user_number)
      .input("car_number", sql.NVarChar, car_number)
      .input("slot_id", sql.Int, slot_id)
      .input("entry_time", sql.DateTime, parsedEntry)
      .input("exit_time", sql.DateTime, parsedExit).query(`
        INSERT INTO user_Table (user_name, user_number, car_number, slot_id, entry_time, exit_time)
        VALUES (@user_name, @user_number, @car_number, @slot_id, @entry_time, @exit_time)
      `);

    // 3. Generate unique code and insert into booking_Table
    const result = await pool
      .request()
      .input("slot_id", sql.Int, slot_id)
      .query("SELECT MAX(user_id) as user_id FROM user_Table");

    const user_id = result.recordset[0].user_id;
    const unique_code = Math.floor(1000 + Math.random() * 9000);

    await pool
      .request()
      .input("user_id", sql.Int, user_id)
      .input("slot_id", sql.Int, slot_id)
      .input("unique_code", sql.Int, unique_code).query(`
        INSERT INTO booking_Table (user_id, slot_id, unique_code)
        VALUES (@user_id, @slot_id, @unique_code)
      `);

    res.status(200).json({ message: "Booking successful", unique_code });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during booking" });
  }
});

// my booking part
app.get("/getMyBooking/:user_number", async (req, res) => {
  const { user_number } = req.params;

  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool
      .request()
      .input("user_number", sql.NVarChar, user_number).query(`
        SELECT 
          u.entry_time,
          u.exit_time,
          b.unique_code,
          s.slot_name,
          p.place_name
        FROM user_Table u
        JOIN booking_Table b ON u.user_id = b.user_id
        JOIN slot_Table s ON u.slot_id = s.slot_id
        JOIN place_Table p ON s.place_id = p.place_id
        WHERE u.user_number = @user_number
        ORDER BY u.entry_time DESC
      `);

    res.json(result.recordset);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ message: "Error fetching booking info" });
  }
});

//History
app.get("/history/:user_number", async (req, res) => {
  const { user_number } = req.params;

  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool
      .request()
      .input("user_number", sql.NVarChar, user_number).query(`
        select 
            u.user_name,
            u.user_number,
            u.car_number,
            p.place_name,
            s.slot_name,
            u.entry_time,
            u.exit_time,
            b.actual_entry_time,
            b.actual_exit_time
            from user_Table u
            join booking_Table b on u.user_id = b.user_id
            join slot_Table s on u.slot_id = s.slot_id
            join place_Table p on s.place_id = p.place_id
            where u.user_number = @user_number
        `);

    res.json(result.recordset);
  } catch (error) {
    console.log("Error while fetching History:", error);
    res.status(500).json({ message: "Error while fetching History" });
  }
});

// POST /api/entry
app.post("/api/entry", async (req, res) => {
  const { user_number, unique_code } = req.body;

  if (!user_number || !unique_code) {
    return res
      .status(400)
      .send("Missing required fields: user_number or unique_code");
  }

  try {
    const pool = await sql.connect(dbConfig);

    // Step 1: Get user ID from user_Table
    const user = await pool
      .request()
      .input("user_number", sql.NVarChar, user_number)
      .query("SELECT * FROM user_Table WHERE user_number = @user_number");

    if (!user.recordset.length) return res.status(404).send("user not found");

    // Step 2: Get the user's unentered bookings within a 15-minute window
    const booking = await pool
      .request()
      .input("user_number", sql.NVarChar, user_number)
      .input("unique_code", sql.Int, unique_code).query(`
            SELECT 
              b.booking_id,
              b.user_id,
              b.slot_id,
              b.unique_code,
              b.actual_entry_time,
              b.actual_exit_time,
              b.is_entered,
              b.is_exited,
              u.user_number
            FROM 
              booking_Table b
            JOIN 
              user_Table u ON b.user_id = u.user_id
            WHERE 
              b.unique_code = @unique_code
              AND u.user_number =  @user_number
	            AND b.is_entered = 0
        `);

    if (!booking.recordset.length)
      return res.status(404).send("No active parking found or already exited");

    const bookingEntryTime = booking.recordset[0].entry_time;

    // Check if the exit is after 15 minutes from the actual exit time
    const fifteenMinutesAfter =
      new Date(bookingEntryTime).getTime() - 15 * 60 * 1000;

    if (Date.now() < fifteenMinutesAfter) {
      return res
        .status(400)
        .send("Entry can only be recorded 15 minutes before the entry time.");
    }

    // Step 3: Mark the selected booking as entered
    await pool
      .request()
      .input("booking_id", sql.Int, booking.recordset[0].booking_id).query(`
        UPDATE booking_Table 
        SET is_entered = 1, actual_entry_time = GETDATE() 
        WHERE booking_id = @booking_id
        `);

    // Step 4: Update the parking slot as occupied
    await pool.request().input("slot_id", sql.Int, booking.recordset[0].slot_id)
      .query(`
        UPDATE slot_Table 
        SET availability = 'Booked' 
        WHERE slot_id = @slot_id
        `);

    res.send("Entry recorded, slot is now Booked");
  } catch (error) {
    console.error("Error processing entry:", error);
    res.status(500).json({ error: "An error occurred during entry" });
  }
});

// POST /api/exit
app.post("/api/exit", async (req, res) => {
  const { user_number, unique_code } = req.body;

  if (!user_number || !unique_code) {
    return res
      .status(400)
      .send("Missing required fields: user_number or unique_code");
  }

  try {
    const pool = await sql.connect(dbConfig);

    // Get user details based on user_number
    const user = await pool
      .request()
      .input("user_number", sql.NVarChar, user_number)
      .query("SELECT * FROM user_Table WHERE user_number = @user_number");

    if (!user.recordset.length) return res.status(404).send("User not found");

    // Get the booking details for the user and unique_code
    const booking = await pool
      .request()
      .input("user_number", sql.NVarChar, user_number)
      .input("unique_code", sql.Int, unique_code).query(`
            SELECT 
              b.booking_id,
              b.user_id,
              b.slot_id,
              b.unique_code,
              b.actual_entry_time,
              b.actual_exit_time,
              b.is_entered,
              b.is_exited,
              u.user_number
            FROM
              booking_Table b
            JOIN
              user_Table u ON b.user_id = u.user_id 
            WHERE 
              b.unique_code = @unique_code
              AND u.user_number = @user_number
              AND b.is_entered = 1
              AND b.is_exited = 0 
          `);

    if (!booking.recordset.length)
      return res.status(400).send("No active parking found or already exited");

    const bookingExitTime = booking.recordset[0].exit_time;

    // Check if the exit is after 15 minutes from the actual exit time
    const fifteenMinutesAfter =
      new Date(bookingExitTime).getTime() + 15 * 60 * 1000;

    if (Date.now() < fifteenMinutesAfter) {
      return res
        .status(400)
        .send("Exit can only be recorded 15 minutes after the exit time.");
    }

    // Update the booking status to exited and record exit time
    await pool
      .request()
      .input("booking_id", sql.Int, booking.recordset[0].booking_id).query(`
        UPDATE booking_Table
        SET is_exited = 1, actual_exit_time = GETDATE()
        WHERE booking_id = @booking_id
      `);

    // Update the slot availability to 'Available'
    await pool.request().input("slot_id", sql.Int, booking.recordset[0].slot_id)
      .query(`
        UPDATE slot_Table
        SET availability = 'Available'
        WHERE slot_id = @slot_id
      `);

    res.send("Exit recorded, slot is now available");
  } catch (error) {
    console.error("Error in /api/exit route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//get user dashboard
app.get("/user", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`  
        select auth_id, username, phone_number, role 
        from auth_Table
        where role = 'user'
      `);
    res.json(result.recordset);
  } catch (error) {
    console.log("Backend error:", error); // helpful for debugging
    res.status(500).json({ error: "Internal server error" });
  }
});

// delete user
app.delete("/user/remove/:phonenumber", async (req, res) => {
  try {
    const { phonenumber } = req.params;
    const pool = await sql.connect(dbConfig);

    const result = await pool
      .request()
      .input("user_number", sql.VarChar, phonenumber)
      .query("DELETE FROM auth_Table WHERE phone_number = @user_number");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.log("Backend error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// update only the username
app.put("/user/update/:phonenumber", async (req, res) => {
  try {
    const { phonenumber } = req.params;
    const { username } = req.body;

    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("user_number", sql.VarChar, phonenumber)
      .input("username", sql.VarChar, username).query(`
        UPDATE auth_Table
        SET username = @username
        WHERE phone_number = @user_number
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Username updated successfully" });
  } catch (error) {
    console.log("Backend error (update):", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// get user details in dashboard
app.get("/user/details/:phonenumber", async (req, res) => {
  try {
    const { phonenumber } = req.params;
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("user_number", sql.VarChar, phonenumber).query(`
        SELECT 
          u.user_name,
          u.user_number,
          u.car_number,
          p.place_name,
          s.slot_name,
          u.entry_time,
          u.exit_time,
          b.actual_entry_time,
          b.actual_exit_time
        FROM user_Table u
        JOIN booking_Table b ON u.user_id = b.user_id
        JOIN slot_Table s ON u.slot_id = s.slot_id
        JOIN place_Table p ON s.place_id = p.place_id
        WHERE u.user_number = @user_number
      `);

    res.json(result.recordset);
  } catch (error) {
    console.log("Backend error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//get slot
app.get("/slot", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
    .query(`
          select s.slot_id, s.slot_name, p.place_name, s.availability 
          from slot_Table s
          join place_Table p on s.place_id = p.place_id
      `);
    res.json(result.recordset);
  } catch (error) {
    console.log("Backend error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
