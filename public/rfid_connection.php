<?php

$servername = "localhost";
$username = "u556129284_gammacare_db";
$password = "q^XnKj4hE~";
$dbname = "u556129284_gammacare_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

function isNewDay($userId)
{
  global $conn;
  $today = date('Y-m-d');
  $sql = "SELECT * FROM attendances WHERE user_id = ? AND date = ?";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("ss", $userId, $today);
  $stmt->execute();
  $result = $stmt->get_result();
  return $result->num_rows === 0;
}

function hasTimedOut($userId)
{
  global $conn;
  $today = date('Y-m-d');
  $sql = "SELECT time_out FROM attendances WHERE user_id = ? AND date = ?";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("ss", $userId, $today);
  $stmt->execute();
  $result = $stmt->get_result();
  if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    return $row['time_out'] !== null;
  }
  return false;
}

function calculateWorkTime($timeIn, $timeOut)
{
  $timeIn = new DateTime($timeIn);
  $timeOut = new DateTime($timeOut);
  $interval = $timeIn->diff($timeOut);
  return $interval->h * 60 + $interval->i; // Convert to minutes
}

if (isset($_POST['rfid'])) {
  $rfid = $_POST['rfid'];

  $sql = "SELECT user_id FROM users WHERE rfid = ?";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("s", $rfid);
  $stmt->execute();
  $result = $stmt->get_result();

  if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $userId = $row['user_id'];

    // Get the current date and time in Asia/Manila timezone
    $currentDateTime = new DateTime('now', new DateTimeZone('Asia/Manila'));
    $currentDate = $currentDateTime->format('Y-m-d'); // for the date column
    $currentTimeStamp = $currentDateTime->format('Y-m-d H:i:s'); // for time_in and time_out

    if (isNewDay($userId)) {
      $sql = "INSERT INTO attendances (user_id, time_in, date, status) VALUES (?, ?, ?, 'present')";
      $stmt = $conn->prepare($sql);
      $stmt->bind_param("sss", $userId, $currentTimeStamp, $currentDate);

      if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Attendance recorded (Time In)"]);
      } else {
        echo json_encode(["status" => "error", "message" => "Error recording attendance"]);
      }
    } else {
      if (hasTimedOut($userId)) {
        echo json_encode(["status" => "error", "message" => "Already timed out"]);
      } else {
        $sql = "UPDATE attendances SET time_out = ? WHERE user_id = ? AND date = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sss", $currentTimeStamp, $userId, $currentDate);

        if ($stmt->execute()) {
          // Calculate accumulated work time
          $sql = "SELECT time_in FROM attendances WHERE user_id = ? AND date = ?";
          $stmt = $conn->prepare($sql);
          $stmt->bind_param("ss", $userId, $currentDate);
          $stmt->execute();
          $result = $stmt->get_result();
          $row = $result->fetch_assoc();
          $timeIn = $row['time_in'];

          $accumulatedWorkTime = calculateWorkTime($timeIn, $currentTimeStamp);

          // Update accumulated work time
          $sql = "UPDATE attendances SET accumulated_work_time = ? WHERE user_id = ? AND date = ?";
          $stmt = $conn->prepare($sql);
          $stmt->bind_param("iss", $accumulatedWorkTime, $userId, $currentDate);
          $stmt->execute();

          echo json_encode([
            "status" => "success",
            "message" => "Attendance updated (Time Out)",
            "accumulated_work_time" => $accumulatedWorkTime
          ]);
        } else {
          echo json_encode(["status" => "error", "message" => "Error updating attendance"]);
        }
      }
    }
  } else {
    echo json_encode(["status" => "error", "message" => "User not found"]);
  }
} else {
  echo json_encode(["status" => "error", "message" => "RFID not provided"]);
}

$conn->close();
