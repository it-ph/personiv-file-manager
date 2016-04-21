<!DOCTYPE html>
<html lang="en" ng-app="guest">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="csrf-token" content="{{ csrf_token() }}">
	<title>File Manager | Personiv</title>
	<!-- Favicon -->
    <link rel="shortcut icon" href="/assets/img/Personiv-Favicon.png">
	<!-- Goolge Fonts Roboto -->
	<link href='https://fonts.googleapis.com/css?family=Roboto:400,100,100italic,300,300italic,400italic,500,500italic,700,700italic' rel='stylesheet' type='text/css'>
	<!-- Vendor CSS -->
	<link rel="stylesheet" href="/assets/css/vendor.css">
	<!-- Shared CSS -->
	<link rel="stylesheet" href="/assets/css/shared.css">
	<!-- Guest CSS -->
	<link rel="stylesheet" href="/assets/css/guest.css">
</head>
<body>
	<!-- Main View -->
	<div class="main-view" ui-view></div>
	<!-- Vendor Scripts -->
	<script src="/assets/js/vendor.js"></script>
	<!-- Shared Script -->
	<script src="/assets/js/shared.js"></script>
	<!-- Guest Script -->
	<script src="/assets/js/guest.js"></script>
</body>
</html>