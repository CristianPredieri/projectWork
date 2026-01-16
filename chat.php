<?php
/* da fare la responsive mobile */

$conn = mysqli_connect("localhost", "root", "", "project1") 
    or die("DBMS non raggiungibile");

session_start();
$utente_id = $_SESSION['utente_id'] ?? 0;

$chatList = "";

// Ciclo utenti (escludendo l'utente loggato)
$result = mysqli_query($conn, "SELECT * FROM utenti WHERE id != $utente_id ORDER BY id");
while ($row = mysqli_fetch_assoc($result)) {

    //da aggiungere nel dbs le immagini profilo e modificare qui
    //metterei un menù a tendina (oppure un'altra roba) dove si aprono le impostazioni
    //dell' account, così si può modificare la parte grafica, sarebbe carino aggiungere anche la caption
    $foto = isset($row['foto']) && $row['foto'] != "" ? 'icone/'.$row['foto'] : 'icone/default.png';
    $nome = htmlspecialchars($row['nome']);
    $cognome = htmlspecialchars($row['cognome']);


    //DEVO CREARE LA PGINA CHAT_SINGOLA.PHP PER GLI UTENTI
    $chatList .= "
    <div class='chat-row'>
        <a href='chat_singola.php?id={$row['id']}'>
            <img src='$foto' class='chat-foto'>
            <span class='chat-nome'>$nome $cognome</span>
        </a>
    </div>";
}

$html = "
<html>
<head>
    <title>PopChat - Chat</title>
    <link rel='stylesheet' href='chat.css'>
</head>
<body>
    <h1>🎈 PopChat 🎈</h1>

    <!-- Pulsante aggiungi contatto -->
    <div style='width: 90%; max-width: 500px; margin-top: 10px; text-align: right;'>
        <button onclick=\"alert('Funzione aggiungi contatto DA FARE!');\" 
                style='padding: 8px 12px; border-radius: 12px; border:none; background-color:#ff4da6; color:white; font-weight:bold; cursor:pointer;'>
            + Aggiungi contatto
        </button>
    </div>

    <!-- Lista chat -->
    <div id='chat-list'>
        $chatList
    </div>

    <div id='conversazione'>
        /* da mettere la chat a destra desktop */
    </div>
</body>
</html>
";


echo $html;
?>