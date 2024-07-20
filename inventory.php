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

function fetchInventory($conn)
{
    $query = "SELECT * FROM inventory"; 
    $result = mysqli_query($conn, $query);
    $inventory = [];

    while ($row = mysqli_fetch_assoc($result)) {
        $inventory[] = $row;
    }

    return $inventory;
}

function addOrUpdateProduct($conn, $product, $quantity, $type, $recipient = null)
{
    $query = "SELECT * FROM inventory WHERE product = '$product'";
    $result = mysqli_query($conn, $query);

    if ($type === 'add') {
        if (mysqli_num_rows($result) > 0) {
            $query = "UPDATE inventory SET quantity = quantity + $quantity WHERE product = '$product'";
            mysqli_query($conn, $query);
            return "Updated quantity: $quantity";
        } else {
            $query = "INSERT INTO inventory (product, quantity) VALUES ('$product', $quantity)";
            mysqli_query($conn, $query);
            return "New product added: $product";
        }
    } elseif ($type === 'update') {
        if (mysqli_num_rows($result) > 0) {
            $query = "UPDATE inventory SET quantity = quantity - $quantity WHERE product = '$product'";
            mysqli_query($conn, $query);
            
            // Record the recipient details
            $query = "INSERT INTO recipients (product, recipient, quantity) VALUES ('$product', '$recipient', $quantity)";
            mysqli_query($conn, $query);
            
            return "Product updated: $product, Quantity: $quantity";
        } else {
            return "Product not found: $product";
        }
    }
}

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(fetchInventory($conn));
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $product = $data['product'];
    $quantity = $data['quantity'];
    $type = $data['type'];
    $recipient = isset($data['recipient']) ? $data['recipient'] : null;

    $response = addOrUpdateProduct($conn, $product, $quantity, $type, $recipient);
    echo json_encode(['message' => $response]);
}

mysqli_close($conn);


?>
