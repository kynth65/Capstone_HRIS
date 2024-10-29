<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);
date_default_timezone_set('Asia/Manila');


$servername = "localhost";
$username = "u556129284_gammacare_db";
$password = "q^XnKj4hE~";
$dbname = "u556129284_gammacare_db";

// Establish database connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

function hasTimeInToday($userId)
{
  global $conn;
  $today = date('Y-m-d');
  $sql = "SELECT * FROM attendances WHERE user_id = ? AND date = ? AND time_in IS NOT NULL";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("ss", $userId, $today);
  $stmt->execute();
  $result = $stmt->get_result();
  $hasTimeIn = $result->num_rows > 0;
  $stmt->close();
  return $hasTimeIn;
}

function hasTimeOutToday($userId)
{
  global $conn;
  $today = date('Y-m-d');
  $sql = "SELECT * FROM attendances WHERE user_id = ? AND date = ? AND time_out IS NOT NULL";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("ss", $userId, $today);
  $stmt->execute();
  $result = $stmt->get_result();
  $hasTimeOut = $result->num_rows > 0;
  $stmt->close();
  return $hasTimeOut;
}

function isNewDay($userId)
{
  global $conn;
  $today = date('Y-m-d');
  $sql = "SELECT * FROM attendances WHERE user_id = ? AND date = ? AND time_out IS NULL";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("ss", $userId, $today);
  $stmt->execute();
  $result = $stmt->get_result();
  $isNew = $result->num_rows === 0;
  $stmt->close();

  return $isNew;
}

function calculateWorkTime($timeIn, $timeOut)
{
  $timeIn = new DateTime($timeIn);
  $timeOut = new DateTime($timeOut);
  $interval = $timeIn->diff($timeOut);
  return $interval->h * 60 + $interval->i;
}

function isLate($userId, $timeIn)
{
  global $conn;

  // Default schedule settings
  $defaultStartTime = "09:00:00"; // 9 AM default start time
  $gracePeriod = 15; // 15 minutes grace period

  try {
    $sql = "SELECT schedule FROM users WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
      $row = $result->fetch_assoc();
      $schedule = $row['schedule'];
      $stmt->close();

      // If schedule is not null and has the correct format
      if ($schedule !== null && strpos($schedule, ' - ') !== false) {
        $scheduleParts = explode(' - ', $schedule);
        if (count($scheduleParts) === 2) {
          $startTime = trim($scheduleParts[0]);
          $startTimeObj = new DateTime(date('Y-m-d') . ' ' . $startTime);
          $startTimeWithGrace = $startTimeObj->add(new DateInterval("PT{$gracePeriod}M"));
          $timeInObj = new DateTime($timeIn);
          return $timeInObj > $startTimeWithGrace;
        }
      }
    }

    // Use default schedule if no valid schedule is found
    $defaultStartTimeObj = new DateTime(date('Y-m-d') . ' ' . $defaultStartTime);
    $defaultStartWithGrace = $defaultStartTimeObj->add(new DateInterval("PT{$gracePeriod}M"));
    $timeInObj = new DateTime($timeIn);

    return $timeInObj > $defaultStartWithGrace;
  } catch (Exception $e) {
    // Log error if needed
    error_log("Error in isLate function: " . $e->getMessage());

    // Use default schedule in case of any error
    $defaultStartTimeObj = new DateTime(date('Y-m-d') . ' ' . $defaultStartTime);
    $defaultStartWithGrace = $defaultStartTimeObj->add(new DateInterval("PT{$gracePeriod}M"));
    $timeInObj = new DateTime($timeIn);

    return $timeInObj > $defaultStartWithGrace;
  }
}

// Function to check if RFID exists in rfid_cards table
function isRfidExists($rfid)
{
  global $conn;
  $sql = "SELECT rfid_uid FROM rfid_cards WHERE rfid_uid = ?";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("s", $rfid);
  $stmt->execute();
  $result = $stmt->get_result();
  $exists = $result->num_rows > 0;
  $stmt->close();
  return $exists;
}

// Function to add RFID to rfid_cards table
function addRfidCard($rfid)
{
  global $conn;

  // Get current date and time
  $currentDateTime = new DateTime('now', new DateTimeZone('Asia/Manila'));
  $createdAt = $currentDateTime->format('Y-m-d H:i:s');

  // Insert new RFID card with the created_at timestamp
  $sql = "INSERT INTO rfid_cards (rfid_uid, status, created_at) VALUES (?, 'available', ?)";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("ss", $rfid, $createdAt);

  if ($stmt->execute()) {
    $stmt->close();
    return true;
  } else {
    $stmt->close();
    return false;
  }
}


function updateDashboardAttendance($userId, $currentTimeStamp, $currentDate, $status, $lateStatus)
{
  global $conn;

  // Check if there's an existing dashboard record for today
  $checkSql = "SELECT * FROM dashboard_attendances WHERE user_id = ? AND date = ? LIMIT 1";
  $checkStmt = $conn->prepare($checkSql);
  $checkStmt->bind_param("ss", $userId, $currentDate);
  $checkStmt->execute();
  $result = $checkStmt->get_result();
  $checkStmt->close();

  // Get the latest record to determine what type of record to create
  $lastRecordSql = "SELECT * FROM dashboard_attendances WHERE user_id = ? AND date = ? ORDER BY id DESC LIMIT 1";
  $lastRecordStmt = $conn->prepare($lastRecordSql);
  $lastRecordStmt->bind_param("ss", $userId, $currentDate);
  $lastRecordStmt->execute();
  $lastRecord = $lastRecordStmt->get_result();
  $lastRecordStmt->close();

  if ($lastRecord->num_rows === 0) {
    // First record of the day - create time in record
    $sql = "INSERT INTO dashboard_attendances (user_id, time_in, time_out, date, status, late) 
                VALUES (?, ?, NULL, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssss", $userId, $currentTimeStamp, $currentDate, $status, $lateStatus);
  } else {
    $lastRow = $lastRecord->fetch_assoc();
    if ($lastRow['time_in'] !== null && $lastRow['time_out'] === null) {
      // Previous record was a time in - create time out record
      $sql = "INSERT INTO dashboard_attendances (user_id, time_in, time_out, date, status, late) 
                    VALUES (?, NULL, ?, ?, ?, ?)";
      $stmt = $conn->prepare($sql);
      $stmt->bind_param("sssss", $userId, $currentTimeStamp, $currentDate, $status, $lateStatus);
    } else {
      // Previous record was a time out - create new time in record
      $sql = "INSERT INTO dashboard_attendances (user_id, time_in, time_out, date, status, late) 
                    VALUES (?, ?, NULL, ?, ?, ?)";
      $stmt = $conn->prepare($sql);
      $stmt->bind_param("sssss", $userId, $currentTimeStamp, $currentDate, $status, $lateStatus);
    }
  }

  $stmt->execute();
  $stmt->close();
}



if (isset($_POST['rfid'])) {
  $rfid = $_POST['rfid'];

  // Find user by RFID
  $sql = "SELECT user_id FROM users WHERE rfid = ?";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("s", $rfid);
  $stmt->execute();
  $result = $stmt->get_result();

  if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $userId = $row['user_id'];

    $currentDateTime = new DateTime('now', new DateTimeZone('Asia/Manila'));
    $currentDate = $currentDateTime->format('Y-m-d');
    $currentTimeStamp = $currentDateTime->format('Y-m-d H:i:s');

    // Check if user has already timed in and out today
    $hasTimeIn = hasTimeInToday($userId);
    $hasTimeOut = hasTimeOutToday($userId);

    if (!$hasTimeIn) {
      // Time In Logic for regular attendance
      $lateStatus = isLate($userId, $currentTimeStamp) ? 'Late' : 'On time';

      // Regular attendance insert
      $sql = "INSERT INTO attendances (user_id, time_in, date, status, late) 
                    VALUES (?, ?, ?, 'present', ?)";
      $stmt = $conn->prepare($sql);
      $stmt->bind_param("ssss", $userId, $currentTimeStamp, $currentDate, $lateStatus);

      if ($stmt->execute()) {
        // Update dashboard attendance
        updateDashboardAttendance($userId, $currentTimeStamp, $currentDate, 'present', $lateStatus);
        echo json_encode(["status" => "success", "message" => "Time In recorded"]);
      } else {
        echo json_encode(["status" => "error", "message" => "Error recording attendance"]);
      }
    } else if ($hasTimeIn && !$hasTimeOut) {
      // Time Out Logic for regular attendance
      $timeInQuery = "SELECT time_in FROM attendances WHERE user_id = ? AND date = ? AND time_out IS NULL";
      $timeInStmt = $conn->prepare($timeInQuery);
      $timeInStmt->bind_param("ss", $userId, $currentDate);
      $timeInStmt->execute();
      $timeInResult = $timeInStmt->get_result();

      if ($timeInResult->num_rows > 0) {
        $timeInRow = $timeInResult->fetch_assoc();
        $timeIn = $timeInRow['time_in'];
        $accumulatedWorkTime = calculateWorkTime($timeIn, $currentTimeStamp);

        // Update regular attendance
        $updateSql = "UPDATE attendances 
                             SET time_out = ?, accumulated_work_time = ? 
                             WHERE user_id = ? AND date = ? AND time_out IS NULL";
        $updateStmt = $conn->prepare($updateSql);
        $updateStmt->bind_param("siss", $currentTimeStamp, $accumulatedWorkTime, $userId, $currentDate);

        if ($updateStmt->execute()) {
          // Update dashboard attendance
          updateDashboardAttendance($userId, $currentTimeStamp, $currentDate, 'present', 'On time');
          echo json_encode([
            "status" => "success",
            "message" => "Time Out recorded",
            "accumulated_work_time" => $accumulatedWorkTime . " minutes"
          ]);
        } else {
          echo json_encode(["status" => "error", "message" => "Error recording Time Out"]);
        }
        $updateStmt->close();
      } else {
        echo json_encode(["status" => "error", "message" => "No Time In record found"]);
      }
      $timeInStmt->close();
    }
    $stmt->close();
  } else {
    // User not found - check if RFID exists in rfid_cards
    if (!isRfidExists($rfid)) {
      // Add to rfid_cards if it doesn't exist
      if (addRfidCard($rfid)) {
        echo json_encode([
          "status" => "success",
          "message" => "New RFID card detected and stored successfully",
          "rfid" => $rfid
        ]);
      } else {
        echo json_encode([
          "status" => "error",
          "message" => "Error storing new RFID card"
        ]);
      }
    } else {
      echo json_encode([
        "status" => "error",
        "message" => "RFID exists but not assigned to any user"
      ]);
    }
  }
} else {
  echo json_encode(["status" => "error", "message" => "RFID not provided"]);
}

$conn->close();
