<?php
session_start();

$conn = mysqli_connect("localhost", "root", "", "project1")
    or die("DBMS non raggiungibile");

if (isset($_POST['submit'])) {
    $telefono = mysqli_real_escape_string($conn, $_POST['telefono']);
    $password = $_POST['password'];

    $sql = "SELECT * FROM utenti WHERE telefono='$telefono' /* in teoria l'ho messo nel dbs -> LIMIT 1 */";
    $result = mysqli_query($conn, $sql);

    if (mysqli_num_rows($result) == 1) {
        $utente = mysqli_fetch_assoc($result);

        if (password_verify($password, $utente['password'])) {
            $_SESSION['utente_id'] = $utente['id'];
            $_SESSION['nome'] = $utente['nome'];
            $_SESSION['cognome'] = $utente['cognome'];

            header("Location: chat.php");
            exit();
        } else {
            $messaggio = "Password errata";
        }
    } else {
        $messaggio = "Utente non trovato";
    }
}

/* Valori di fallback */
$telefono  = $telefono ?? '';
$messaggio = $messaggio ?? '';

$html = "
<html>
<head>
    <title>PopChat - Login</title>

    <link rel='manifest' href='manifest.json'>

    <script>
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(() => console.log('Service Worker registrato'))
            .catch(err => console.log(err));
    }
    </script>

    <style>
        body {
            font-family: 'Arial Rounded MT Bold', Arial, sans-serif;
            background: linear-gradient(to bottom right, #ffecd2, #fcb69f);
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        h1 {
            margin-top: 40px;
            color: #fff;
            text-shadow: 2px 2px #ff5f6d;
        }
        #form {
            margin-top: 30px;
            background-color: #ff8b94;
            padding: 25px;
            border-radius: 20px;
            width: 90%;
            max-width: 400px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            text-align: center;
        }
        input {
            width: 90%;
            padding: 10px;
            margin-bottom: 15px;
            border-radius: 15px;
            border: 2px solid #fff;
            font-size: 16px;
        }
        input[type='submit'] {
            background-color: #ffde59;
            font-weight: bold;
            cursor: pointer;
        }
        input[type='submit']:hover {
            background-color: #ffb347;
            color: #fff;
        }
        #messaggio {
            margin-top: 10px;
            color: #fff;
            font-weight: bold;
        }
    </style>
</head>

<body>
    <h1>🎈 PopChat 🎈</h1>

    <div id='form'>
        <h2>Accedi</h2>

        <form method='POST'>
            <input type='tel' name='telefono' placeholder='Telefono'
                   value='" . htmlspecialchars($telefono) . "' required><br>

            <input type='password' name='password' placeholder='Password' required><br>

            <input type='submit' name='submit' value='Accedi'>
        </form>

        " . ($messaggio ? "<div id='messaggio'>$messaggio</div>" : "") . "
    </div>
</body>
</html>
";

echo $html;
