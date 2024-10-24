<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);
date_default_timezone_set('Asia/Manila');


$servername = "localhost";
$username = "u556129284_gammacare_db";
$password = "q^XnKj4hE~";
$dbname = "u556129284_gammacare_db";

// Database connection details
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "gammacare_db";

// Establish database connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

// Function to check if it's a new day for attendance
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

// Function to calculate accumulated work time in minutes
function calculateWorkTime($timeIn, $timeOut)
{
  $timeIn = new DateTime($timeIn);
  $timeOut = new DateTime($timeOut);
  $interval = $timeIn->diff($timeOut);
  return $interval->h * 60 + $interval->i;
}

// Function to determine if the user is late based on their schedule and time in
function isLate($userId, $timeIn)
{
  global $conn;
  $sql = "SELECT schedule FROM users WHERE user_id = ?";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("s", $userId);
  $stmt->execute();
  $result = $stmt->get_result();

  if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $schedule = $row['schedule'];
    $stmt->close();

    // Split the schedule to get the start time
    $scheduleParts = explode(' - ', $schedule);
    if (count($scheduleParts) === 2) {
      $startTime = trim($scheduleParts[0]);
      $gracePeriod = 15; // Grace period in minutes
      $startTimeWithGrace = (new DateTime($startTime))->add(new DateInterval("PT{$gracePeriod}M"));

      // Check if time in is later than the start time with grace period
      $timeIn = new DateTime($timeIn);
      return $timeIn > $startTimeWithGrace;
    }
  }

  return false;
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

    if (isNewDay($userId)) {
      // Determine lateness based on the user's schedule and time in
      $lateStatus = isLate($userId, $currentTimeStamp) ? 'Late' : 'On time';

      // Record Time In
      $sql = "INSERT INTO attendances (user_id, time_in, date, status, late) VALUES (?, ?, ?, 'present', ?)";
      $stmt = $conn->prepare($sql);
      $stmt->bind_param("ssss", $userId, $currentTimeStamp, $currentDate, $lateStatus);

      if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Attendance recorded (Time In)"]);
      } else {
        echo json_encode(["status" => "error", "message" => "Error recording attendance"]);
      }
    } else {
      // Record Time Out
      $timeInQuery = "SELECT time_in FROM attendances WHERE user_id = ? AND date = ? AND time_out IS NULL";
      $timeInStmt = $conn->prepare($timeInQuery);
      $timeInStmt->bind_param("ss", $userId, $currentDate);
      $timeInStmt->execute();
      $timeInResult = $timeInStmt->get_result();

      if ($timeInResult->num_rows > 0) {
        $timeInRow = $timeInResult->fetch_assoc();
        $timeIn = $timeInRow['time_in'];
        $accumulatedWorkTime = calculateWorkTime($timeIn, $currentTimeStamp);

        $updateSql = "UPDATE attendances SET time_out = ?, accumulated_work_time = ? WHERE user_id = ? AND date = ? AND time_out IS NULL";
        $stmt = $conn->prepare($updateSql);
        $stmt->bind_param("siss", $currentTimeStamp, $accumulatedWorkTime, $userId, $currentDate);

        if ($stmt->execute()) {
          echo json_encode([
            "status" => "success",
            "message" => "Attendance updated (Time Out)",
            "accumulated_work_time" => $accumulatedWorkTime . " minutes"
          ]);
        } else {
          echo json_encode(["status" => "error", "message" => "Error updating attendance"]);
        }
      } else {
        echo json_encode(["status" => "error", "message" => "Error retrieving Time In"]);
      }
      $timeInStmt->close();
    }
    $stmt->close();
  } else {
    echo json_encode(["status" => "error", "message" => "User not found"]);
  }
} else {
  echo json_encode(["status" => "error", "message" => "RFID not provided"]);
}

$conn->close();
