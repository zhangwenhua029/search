<?php
session_start ();
header ( "Content-Type:text/html;charset=utf-8" );
include '../php/database.php';//数据库文件
error_reporting ( E_ALL ^ E_NOTICE );
if (! isset ( $_SESSION ['login'] )) {
	$_SESSION ['login'] = 0;
}
if (! isset ( $_SESSION ['loginname'] )) {
	$_SESSION ['loginname'] = "";
}
if (! isset ( $_SESSION ['isboss'] )) {
	$_SESSION ['isboss'] = 0;
}
$data = $_REQUEST ["data"];
$do = $data ['do'];

switch ($do) {
	case "test" :
		print_r ( $data );
		break;
	case "unload" :
		session_destroy ();
		break;
	case "islogin" :
		$user ["islogin"] = $_SESSION ['login'];
		$user ['loginname'] = $_SESSION ['loginname'];
		$user ['isboss'] = $_SESSION ['isboss'];
		echo json_encode ( $user );
		break;
	case "exit" :
		$_SESSION ['login'] = 0;
		$_SESSION ['loginname'] = "";
		$_SESSION ['isboss'] = 0;
		break;
	case "login" :
		login ( $mysqli, $data );
		break;
	case "search":
		search($mysqli, $data);
}

function search($mysqli, $data) {
	$value = trim ( $data ['value'] );
	$itemId = $data ['itemId'];
	$user ['num'] = 0;
	if ($value == '') {
		$sql = <<<SQL
			SELECT voteId,vote_name FROM vote_theme
			LIMIT 0,5;
SQL;
	} elseif ($itemId != 0) {
		$sql = <<<SQL
			SELECT * FROM vote_theme
			WHERE voteId={$itemId};
SQL;
	} else {
		$sql = <<<SQL
			SELECT voteId,vote_name FROM vote_theme
			WHERE vote_name LIKE '%{$value}%';
SQL;
	}
	$result = $mysqli->query ( $sql );
	if ($mysqli->affectRows () > 0) {
		$user ['num'] = $result->num_rows;
		while ( $row = $result->fetch_assoc () ) {
			$user [count ( $user )] = $row;
		}
	}
	echo json_encode ( $user );
}

function login($mysqli, $data) {
	$name = $data ["name"];
	$passport = $data ["passport"];
	$sql = <<<SQL
			SELECT * FROM users
			WHERE userName='{$name}';
SQL;
	$result = $mysqli->query ( $sql );
	if ($mysqli->affectRows () > 0) {
		$sql = <<<SQL
			SELECT * FROM users
			WHERE userName='{$name}' AND userPassword='{$passport}';
SQL;
		$result = $mysqli->query ( $sql );
		if ($mysqli->affectRows () > 0) {
			$row = $result->fetch_assoc ();
			if (! $row ['userWhether']) {
				$_SESSION ['login'] = 1;
				$_SESSION ['loginname'] = $name;
				$_SESSION ['isboss'] = $row ['userRights'] ? 0 : 1;
				$user ['loginresult'] = 0;
				$arr=$result->lengths;
			} else {
				$user ['loginresult'] = 3;
			}
		} else {
			$user ['loginresult'] = 1;
		}
	} else {
		$user ['loginresult'] = 2;
	}
	echo json_encode ( $user );
}
?>
