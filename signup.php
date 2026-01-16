<?php

/* dopo il signup farei che la chat.php inizi vuota con la possibilità di aggiungere i contatti. */


session_start();

$conn = mysqli_connect("localhost", "root", "", "project1")
    or die("DBMS non raggiungibile");

if (isset($_POST['submit'])) {
    $nome     = mysqli_real_escape_string($conn, $_POST['nome']);
    $cognome  = mysqli_real_escape_string($conn, $_POST['cognome']);
    $telefono = mysqli_real_escape_string($conn, $_POST['telefono']);
    $password = $_POST['password'];

    if ($password == "") {
        $messaggio = "Password obbligatoria";
    } else {

        /* controllo utente già registrato */
        $check = mysqli_query(
            $conn,
            "SELECT id FROM utenti WHERE telefono='$telefono' LIMIT 1"
        );

        if (mysqli_num_rows($check) > 0) {
            $messaggio = "utente già registrato con questo telefono" .
                         " <br> Hai già un account? <a href='login.php'>Login </a>";
        } else {
            //qui c'è la crittografia della psw, ancora non so bene come gestirla nel dbs e non so come aggiornarlo vosibilmente
            $password_hash = password_hash($password, PASSWORD_DEFAULT);

            $sql = "INSERT INTO utenti (nome, cognome, telefono, password)
                    VALUES ('$nome', '$cognome', '$telefono', '$password_hash')";

            if (mysqli_query($conn, $sql)) {
                $ultimo_id = mysqli_insert_id($conn);

                $_SESSION['utente_id'] = $ultimo_id;
                $_SESSION['nome'] = $nome;
                $_SESSION['cognome'] = $cognome;

                header("Location: chat.php");
                exit();
            } else {
                $messaggio = "Errore durante l'iscrizione";
            }
        }
    }
}

$nome = $nome ?? '';
$cognome = $cognome ?? '';
$telefono = $telefono ?? '';
$messaggio = $messaggio ?? '';

/* lista utenti (solo per test) */
$users = "";
$result = mysqli_query($conn, "SELECT * FROM utenti ORDER BY id");
while ($row = mysqli_fetch_assoc($result)) {
    $users .= htmlspecialchars($row['nome']) . " " .
        htmlspecialchars($row['cognome']) . " - " .
        htmlspecialchars($row['telefono']) . "<br>";
}

$html = "
<html>
<head>
    <title>PopChat - Registrazione</title>
    <style>
        body {
            font-family: 'Arial Rounded MT Bold', Arial, sans-serif;
            background: linear-gradient(to bottom right, #ffecd2, #fcb69f);
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
            text-align: center;
        }
        input {
            width: 90%;
            padding: 10px;
            margin-bottom: 15px;
            border-radius: 15px;
            border: 2px solid #fff;
        }
        input[type='submit'] {
            background-color: #ffde59;
            font-weight: bold;
            cursor: pointer;
        }
        #welcome {
            margin-top: 15px;
            color: black;
            font-weight: bold;
        }
    </style>
</head>

<body>
<h1>🎈 PopChat 🎈</h1>

<div id='form'>
    <h2>Iscriviti!</h2>
    <form method='POST'>
        <input type='text' name='nome' placeholder='Nome'
               value='" . htmlspecialchars($nome) . "' required><br>

        <input type='text' name='cognome' placeholder='Cognome'
               value='" . htmlspecialchars($cognome) . "' required><br>

        <input type='tel' name='telefono' placeholder='Telefono'
               value='" . htmlspecialchars($telefono) . "' required><br>

        <input type='password' name='password' placeholder='Password' required><br>

        <input type='submit' name='submit' value='Iscriviti'>
    </form>

    " . ($messaggio ? "<div id='welcome'>$messaggio</div>" : "") . "
</div>

<div id='users'>
    <h3>Utenti registrati (test)</h3>
    $users
</div>

</body>
</html>
";

echo $html;
