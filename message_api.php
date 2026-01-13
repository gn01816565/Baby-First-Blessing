<?php
require '../mybank/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

$file = __DIR__ . '/messages.xlsx';

function getSpreadsheet($file) {
    if (!file_exists($file)) {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setCellValue('A1', 'ID');
        $sheet->setCellValue('B1', '時間');
        $sheet->setCellValue('C1', '暱稱');
        $sheet->setCellValue('D1', '內容');
        return $spreadsheet;
    }
    return IOFactory::load($file);
}

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// GET: 讀取留言
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!file_exists($file)) {
        echo json_encode([]);
        exit;
    }
    
    $spreadsheet = IOFactory::load($file);
    $sheet = $spreadsheet->getActiveSheet();
    $rows = $sheet->toArray();
    
    $messages = [];
    // 跳過標題列，從第二列開始
    for ($i = 1; $i < count($rows); $i++) {
        $row = $rows[$i];
        if (!empty($row[0])) { // ID 存在才讀取
            $messages[] = [
                'id' => (string)$row[0],
                'timestamp' => $row[1],
                'author' => $row[2],
                'content' => $row[3],
                'tier' => 'tier-1' // 預設值，因為 Excel 目前沒存 tier
            ];
        }
    }
    
    // 按時間倒序排列
    usort($messages, function($a, $b) {
        return strtotime($b['timestamp']) - strtotime($a['timestamp']);
    });
    
    echo json_encode($messages);
    exit;
}

// POST: 新增留言
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if ($data && isset($data['author']) && isset($data['content'])) {
        $spreadsheet = getSpreadsheet($file);
        $sheet = $spreadsheet->getActiveSheet();
        $row = $sheet->getHighestRow() + 1;

        $id = $data['id'] ?? (string)time();
        $timestamp = date('Y-m-d H:i:s');

        $sheet->setCellValue('A' . $row, $id);
        $sheet->setCellValue('B' . $row, $timestamp);
        $sheet->setCellValue('C' . $row, $data['author']);
        $sheet->setCellValue('D' . $row, $data['content']);

        $writer = new Xlsx($spreadsheet);
        $writer->save($file);

        echo json_encode(['status' => 'success']);
    } else {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing data']);
    }
    exit;
}

// DELETE: 刪除留言 (依 ID)
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing ID']);
        exit;
    }

    if (!file_exists($file)) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'File not found']);
        exit;
    }

    $spreadsheet = IOFactory::load($file);
    $sheet = $spreadsheet->getActiveSheet();
    $highestRow = $sheet->getHighestRow();
    
    $found = false;
    for ($row = 2; $row <= $highestRow; $row++) {
        if ((string)$sheet->getCell('A' . $row)->getValue() === $id) {
            $sheet->removeRow($row);
            $found = true;
            break; 
        }
    }

    if ($found) {
        $writer = new Xlsx($spreadsheet);
        $writer->save($file);
        echo json_encode(['status' => 'success']);
    } else {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Message not found']);
    }
    exit;
}
