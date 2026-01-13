<?php
require '../mybank/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;

// 設定 CORS，允許前端跨域（如果需要）
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 接收 JSON 資料
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if ($data && isset($data['author']) && isset($data['content'])) {
        $file = __DIR__ . '/messages.xlsx';
        
        if (!file_exists($file)) {
            // 如果檔案不存在，建立新檔案並寫入標題
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setCellValue('A1', '時間');
            $sheet->setCellValue('B1', '暱稱');
            $sheet->setCellValue('C1', '內容');
            $row = 2;
        } else {
            // 載入現有檔案
            $spreadsheet = IOFactory::load($file);
            $sheet = $spreadsheet->getActiveSheet();
            $row = $sheet->getHighestRow() + 1;
        }

        // 寫入新資料
        $sheet->setCellValue('A' . $row, date('Y-m-d H:i:s'));
        $sheet->setCellValue('B' . $row, $data['author']);
        $sheet->setCellValue('C' . $row, $data['content']);

        // 儲存檔案
        $writer = new Xlsx($spreadsheet);
        $writer->save($file);

        echo json_encode(['status' => 'success', 'message' => '留言已儲存']);
    } else {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => '資料不完整']);
    }
} else {
    // 如果是 GET，可以選擇下載檔案或列出資料（這裡暫不實作）
    echo "Method not allowed";
}
