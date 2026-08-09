<?php
/* ╔══════════════════════════════════════════════════════════════╗
   ║   ✉️  SMTP CONFIGURATION — EDIT THIS BLOCK ONLY               ║
   ║   Mail sent from the Contact form is delivered through       ║
   ║   these credentials straight to MAIL_TO.                     ║
   ╚══════════════════════════════════════════════════════════════╝ */
const SMTP_HOST        = 'smtp.your-mail-provider.com';  // e.g. smtp.zoho.eu / smtp.gmail.com
const SMTP_PORT        = 587;                             // 587 = TLS, 465 = SSL
const SMTP_SECURE      = 'tls';                           // 'tls' or 'ssl'
const SMTP_USER        = 'support@auronexta.uk';
const SMTP_PASS        = 'YOUR_APP_PASSWORD_HERE';        // ← EDIT
const MAIL_TO          = 'support@auronexta.uk';          // ← where mail arrives
const MAIL_FROM_NAME   = 'AuroNexta Website';
/* ═══════════════════ END OF EDITABLE BLOCK ═══════════════════ */

header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok'=>false,'error'=>'Method not allowed']);
  exit;
}

$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) $in = $_POST;

$clean = function($v) { return trim(strip_tags((string)$v)); };
$name  = $clean($in['name']  ?? '');
$email = $clean($in['email'] ?? '');
$subj  = $clean($in['subject'] ?? '');
$msg   = $clean($in['message'] ?? '');

if (!empty($in['company'])) {
  echo json_encode(['ok'=>false,'error'=>'spam']);
  exit;
}

if (!$name || !$subj || !$msg || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  echo json_encode(['ok'=>false,'error'=>'Invalid input']);
  exit;
}

$body = "Name: $name\nEmail: $email\nSubject: $subj\n\nMessage:\n$msg";
$res  = smtp_mail(SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS,
                  MAIL_TO, MAIL_FROM_NAME, $email, 'New website enquiry: '.$subj, $body);
echo json_encode($res);

/* ---------- dependency-free minimal SMTP client ---------- */
function smtp_mail($host, $port, $secure, $user, $pass, $to, $fromName, $replyTo, $subject, $body) {
  $errno  = 0;
  $errstr = '';
  $fp = @fsockopen(($secure === 'ssl' ? 'ssl://' : '').$host, $port, $errno, $errstr, 12);
  if (!$fp) return ['ok'=>false, 'error'=>'connect: '.$errstr];

  stream_set_timeout($fp, 12);
  $read = function() use ($fp) {
    $d = '';
    while ($l = fgets($fp, 512)) {
      $d .= $l;
      if (substr($l, 3, 1) === ' ') break;
    }
    return $d;
  };

  $cmd = function($c, $exp) use ($fp, $read) {
    fputs($fp, $c . "\r\n");
    $r = $read();
    return (strpos($r, $exp) === 0) ? $r : null;
  };

  $read(); // greeting

  if ($secure === 'tls') {
    if (!$cmd('EHLO web', '250')) return ['ok'=>false,'error'=>'ehlo'];
    if (!$cmd('STARTTLS', '220')) return ['ok'=>false,'error'=>'starttls'];
    if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT)) {
      return ['ok'=>false,'error'=>'tls'];
    }
  }

  if (!$cmd('EHLO web', '250')) return ['ok'=>false,'error'=>'ehlo2'];

  if ($user !== '') {
    if (!$cmd('AUTH LOGIN', '334')) return ['ok'=>false,'error'=>'auth'];
    if (!$cmd(base64_encode($user), '334')) return ['ok'=>false,'error'=>'user'];
    if (!$cmd(base64_encode($pass), '235')) return ['ok'=>false,'error'=>'pass'];
  }

  if (!$cmd('MAIL FROM:<'.SMTP_USER.'>', '250')) return ['ok'=>false,'error'=>'from'];
  if (!$cmd('RCPT TO:<'.$to.'>', '250'))         return ['ok'=>false,'error'=>'to'];
  if (!$cmd('DATA', '354'))                     return ['ok'=>false,'error'=>'data'];

  $eol = "\r\n";
  $b64 = base64_encode($body);
  $head = 'From: '.MAIL_FROM_NAME.' <'.SMTP_USER.'>'.$eol
        .'Reply-To: '.$replyTo.$eol
        .'To: '.$to.$eol
        .'Subject: =?UTF-8?B?'.base64_encode($subject).'?='.$eol
        .'MIME-Version: 1.0'.$eol
        .'Content-Type: text/plain; charset=UTF-8'.$eol
        .'Content-Transfer-Encoding: base64'.$eol.$eol;

  fputs($fp, $head . chunk_split($b64, 76, $eol) . $eol . '.' . $eol);
  $r = $read();
  fclose($fp);
  return (strpos($r, '250') === 0) ? ['ok'=>true] : ['ok'=>false,'error'=>'send'];
}
