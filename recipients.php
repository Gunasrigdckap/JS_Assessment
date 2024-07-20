<?php
$config = include('./config.php');

class Databaseconnection
{
    public $connection;

    public function __construct($config)
    {
        $this->connection = mysqli_connect($config["host"], $config["username"], $config["password"], $config["db_name"]);

        if (!$this->connection) {
            die("Connection failed: " . mysqli_connect_error());
        }
    }

    public function dbConnection()
    {
        return $this->connection;
    }
}

// Create a new instance of the Databaseconnection class
$database = new Databaseconnection($config);
$conn = $database->dbConnection();

function fetchRecipients($conn)
{
    $query = "SELECT * FROM recipients"; 
    $result = mysqli_query($conn, $query);
    $recipients = [];

    while ($row = mysqli_fetch_assoc($result)) {
        $recipients[] = $row;
    }

    return $recipients;
}

function addRecipient($conn, $product, $quantity, $recipient)
{
    $query = "INSERT INTO recipients (product, recipient, quantity, timestamp) VALUES ('$product', '$recipient', $quantity, NOW())";
    if (mysqli_query($conn, $query)) {
        return "Recipient details added.";
    } else {
        return "Error: " . mysqli_error($conn);
    }
}

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(fetchRecipients($conn));
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $product = $data['product'];
    $quantity = $data['quantity'];
    $recipient = $data['recipient'];

    $response = addRecipient($conn, $product, $quantity, $recipient);
    echo json_encode(['message' => $response]);
}

mysqli_close($conn);
?>
