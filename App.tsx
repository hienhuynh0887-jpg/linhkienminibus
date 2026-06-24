import { useState, useMemo, useRef, useCallback, Fragment, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase client ──
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


const BOM_XH = [
  {stt:1,id:"KL2804 500MN16-1",ten:"Cụm hàn dầm chống va sau",dv:"Cái",dm:1,dmuc:"Cụm lắp ráp FT",vt:"FT04-001",gc:""},
  {stt:2,id:"KL6100 100MN16-1",ten:"Cụm cửa trước bên trái",dv:"Cái",dm:1,dmuc:"Cụm lắp ráp FT",vt:"FT04-002",gc:""},
  {stt:3,id:"KL6100 200MN16-1",ten:"Cụm cửa trước bên phải",dv:"Cái",dm:1,dmuc:"Cụm lắp ráp FT",vt:"FT04-003",gc:""},
  {stt:4,id:"KL6300 100MN16-1",ten:"Cụm cửa hậu bên trái",dv:"Cái",dm:1,dmuc:"Cụm lắp ráp FT",vt:"FT04-004",gc:""},
  {stt:5,id:"KL6300 200MN16-1",ten:"Cụm cửa hậu bên phải",dv:"Cái",dm:1,dmuc:"Cụm lắp ráp FT",vt:"FT04-005",gc:""},
  {stt:6,id:"Q1841080",ten:"Bu lông mặt bích lục giác M10x80",dv:"Cái",dm:4,dmuc:"Bu lông - Đai ốc",vt:"FT04-006",gc:"Lắp dầm chống va sau"},
  {stt:7,id:"Q1860830",ten:"Bu lông mặt bích lục giác M8x30",dv:"Cái",dm:8,dmuc:"Bu lông - Đai ốc",vt:"FT04-007",gc:""},
  {stt:8,id:"Q32208L",ten:"Bộ đai ốc lục giác M8 và vòng đệm đàn hồi côn",dv:"Cái",dm:12,dmuc:"Bu lông - Đai ốc",vt:"FT04-008",gc:""},
  {stt:9,id:"KL8215 021MN16-1L",ten:"Giá đỡ lắp tay vịn có kèm đai ốc",dv:"Cái",dm:1,dmuc:"Cụm lắp ráp FT",vt:"FT05-001",gc:"Thêm mới"},
  {stt:10,id:"KL8402 000MN16-1",ten:"Cụm nắp động cơ",dv:"Cái",dm:1,dmuc:"Cụm lắp ráp FT",vt:"FT05-002",gc:""},
  {stt:11,id:"KL8403 100MN16-1",ten:"Cụm hàn chắn bùn bên trái",dv:"Cái",dm:1,dmuc:"Cụm lắp ráp FT",vt:"FT05-003",gc:""},
  {stt:12,id:"KL8403 200MN16-1",ten:"Cụm hàn chắn bùn bên phải",dv:"Cái",dm:1,dmuc:"Cụm lắp ráp FT",vt:"FT05-004",gc:""},
  {stt:13,id:"Q1840616",ten:"Bu lông mặt bích lục giác M6x16",dv:"Cái",dm:25,dmuc:"Bu lông - Đai ốc",vt:"FT05-005",gc:"Lắp vè chắn bùn"},
  {stt:14,id:"Q1840820",ten:"Bu lông mặt bích lục giác M8x20",dv:"Cái",dm:4,dmuc:"Bu lông - Đai ốc",vt:"FT05-006",gc:"Lắp capo"},
  {stt:15,id:"Q40206",ten:"Vòng đệm phẳng M6",dv:"Cái",dm:22,dmuc:"Bu lông - Đai ốc",vt:"FT05-007",gc:"Lắp vè chắn bùn"},
  {stt:16,id:"KL6200 200MN16-1",ten:"Cụm cửa trượt",dv:"Cái",dm:1,dmuc:"Cụm lắp ráp FT",vt:"FT06-001",gc:""},
  {stt:17,id:"Q1860820",ten:"Bu lông lục giác mặt bích cỡ lớn M8x20mm",dv:"Cái",dm:8,dmuc:"Bu lông - Đai ốc",vt:"FT06-002",gc:"Lắp cửa trượt"},
  {stt:18,id:"KL2803 300MN16-1",ten:"Cụm hàn dầm chống va trước",dv:"Cái",dm:1,dmuc:"Tổng thành thân xe MB",vt:"MB15-001",gc:""},
  {stt:19,id:"KL5400 036MN16-1",ten:"Tấm ngăn trụ B bên phải",dv:"Cái",dm:1,dmuc:"Tổng thành thân xe MB",vt:"MB15-002",gc:""},
  {stt:20,id:"KL5400 038MN16-1",ten:"Tấm ngăn trụ C bên phải",dv:"Cái",dm:1,dmuc:"Tổng thành thân xe MB",vt:"MB15-003",gc:""},
  {stt:21,id:"Q1841030",ten:"Bu lông mặt bích lục giác M10x30",dv:"Cái",dm:10,dmuc:"Bu lông - Đai ốc",vt:"MB15-004",gc:"Lắp dầm chống va trước"},
  {stt:22,id:"KL5400 100MN16-1",ten:"Cụm hàn thành bên trái",dv:"Cái",dm:1,dmuc:"Tổng thành thân xe MB",vt:"MB20-001",gc:""},
  {stt:23,id:"KL5400 200MN16-1",ten:"Cụm hàn thành bên phải",dv:"Cái",dm:1,dmuc:"Tổng thành thân xe MB",vt:"MB20-002",gc:""},
  {stt:24,id:"KL5701 100MN16-1",ten:"Cụm dầm ngang trước nóc xe",dv:"Cái",dm:1,dmuc:"Tổng thành thân xe MB",vt:"MB20-003",gc:""},
  {stt:25,id:"KL5701 300MN16-1",ten:"Cụm dầm ngang trên nóc xe",dv:"Cái",dm:1,dmuc:"Tổng thành thân xe MB",vt:"MB20-004",gc:""},
  {stt:26,id:"KL5701 301MN16-1L",ten:"Dầm ngang giữa nóc xe (có đai ốc)",dv:"Cái",dm:5,dmuc:"Tổng thành thân xe MB",vt:"MB20-005",gc:""},
  {stt:27,id:"KL5701 900MN16-1",ten:"Cụm tấm trong dầm ngang sau nóc xe",dv:"Cái",dm:1,dmuc:"Tổng thành thân xe MB",vt:"MB20-006",gc:""},
  {stt:28,id:"KL5701 301MN16-1",ten:"Dầm ngang giữa nóc xe",dv:"Cái",dm:5,dmuc:"Tổng thành thân xe MB",vt:"MB50-001",gc:""},
  {stt:29,id:"KL5701 011MN16-1",ten:"Đoạn trước nóc xe",dv:"Cái",dm:1,dmuc:"Tổng thành thân xe MB",vt:"MB70-001",gc:""},
  {stt:30,id:"KL5701 013MN16-1",ten:"Đoạn giữa nóc xe",dv:"Cái",dm:1,dmuc:"Tổng thành thân xe MB",vt:"MB70-002",gc:""},
  {stt:31,id:"KL5701 015MN16-1",ten:"Đai ốc tán kéo lỗ mù M5",dv:"Cái",dm:4,dmuc:"Bu lông - Đai ốc",vt:"MB70-003",gc:""},
  {stt:32,id:"KL5701 700MN16-1",ten:"Cụm tấm ngoài dầm ngang sau nóc xe",dv:"Cái",dm:1,dmuc:"Tổng thành thân xe MB",vt:"MB70-004",gc:""},
  {stt:33,id:"KL5130 500MN16-1",ten:"Cụm hàn tấm bậc cửa sau",dv:"Cái",dm:1,dmuc:"Tổng thành thân xe MB",vt:"MB90-001",gc:""},
  {stt:34,id:"KL5301 500MN16-1",ten:"Cụm hàn dầm ngang trên kính chắn gió trước",dv:"Cái",dm:1,dmuc:"Tổng thành thân xe MB",vt:"MB90-002",gc:""},
  {stt:35,id:"KL2801 100MN16-1",ten:"Tổng thành hàn tấm đậy dầm dọc trái",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-001",gc:""},
  {stt:36,id:"KL2801 130MN16-1",ten:"Tổng thành hàn tấm gia cường đoạn trước dầm dọc trái",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-002",gc:""},
  {stt:37,id:"KL2801 140MN16-1",ten:"Cụm hàn tấm gia cường đoạn trước dầm dọc phải",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-003",gc:""},
  {stt:38,id:"KL2801 150MN16-1",ten:"Tổng thành hàn tấm đỡ đoạn trước dầm dọc trái",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-004",gc:""},
  {stt:39,id:"KL2801 153MN16-1L",ten:"Giá đỡ bên trái giá treo động cơ I",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-005",gc:""},
  {stt:40,id:"KL2801 154MN16-1L",ten:"Giá đỡ bên phải giá treo động cơ I",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-006",gc:""},
  {stt:41,id:"KL2801 155MN16-1L",ten:"Giá đỡ bên trái giá treo động cơ II",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-007",gc:""},
  {stt:42,id:"KL2801 156MN16-1L",ten:"Giá đỡ bên phải giá treo động cơ II",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-008",gc:""},
  {stt:43,id:"KL2801 160MN16-1",ten:"Cụm hàn tấm đỡ đoạn trước dầm dọc phải",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-009",gc:""},
  {stt:44,id:"KL2801 170MN16-1",ten:"Tổng thành hàn giá đỡ lắp móc kéo xe",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-010",gc:""},
  {stt:45,id:"KL2801 171MN16-1L",ten:"Đoạn trước dầm dọc trái sàn trước",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-011",gc:""},
  {stt:46,id:"KL2801 172MN16-1L",ten:"Đoạn trước dầm dọc phải sàn trước",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-012",gc:""},
  {stt:47,id:"KL2801 173MN16-1L",ten:"Đoạn sau dầm dọc trái sàn trước",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-013",gc:""},
  {stt:48,id:"KL2801 174MN16-1L",ten:"Đoạn sau dầm dọc phải sàn trước",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-014",gc:""},
  {stt:49,id:"KL2801 175MN16-1",ten:"Tấm liên kết chắn bánh trước trái",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-015",gc:""},
  {stt:50,id:"KL2801 176MN16-1",ten:"Tấm liên kết vè bánh trước phải",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-016",gc:""},
  {stt:51,id:"KL2801 192MN16-1L",ten:"Giá đỡ lắp bình nước rửa kính",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-017",gc:""},
  {stt:52,id:"KL2801 200MN16-1",ten:"Cụm hàn tấm đậy dầm dọc phải",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-018",gc:""},
  {stt:53,id:"KL2801 201MN16-1L",ten:"Tấm lắp dầm chống va trước dầm dọc trái",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-019",gc:""},
  {stt:54,id:"KL2801 202MN16-1L",ten:"Tấm lắp dầm chống va trước dầm dọc phải",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-020",gc:""},
  {stt:55,id:"KL2801 203MN16-1",ten:"Tấm gia cường đoạn sau dầm dọc sàn trước I",dv:"Cái",dm:2,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-021",gc:""},
  {stt:56,id:"KL2801 205MN16-1",ten:"Tấm gia cường đoạn sau dầm dọc sàn trước II",dv:"Cái",dm:2,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-022",gc:""},
  {stt:57,id:"KL2801 215MN16-1L",ten:"Giá đỡ lắp bộ lọc sơ cấp nhiên liệu I",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-023",gc:""},
  {stt:58,id:"KL2801 230MN16-1",ten:"Tổng thành hàn giá phụ dầm dọc trái",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-024",gc:""},
  {stt:59,id:"KL2801 233MN16-1",ten:"Giá đỡ lắp ống mềm phanh trước trái",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-025",gc:""},
  {stt:60,id:"KL2801 234MN16-1",ten:"Giá đỡ lắp ống mềm phanh trước phải",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-026",gc:""},
  {stt:61,id:"KL2801 240MN16-1",ten:"Cụm hàn khung phụ dầm dọc phải sàn trước",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-027",gc:""},
  {stt:62,id:"KL2801 710MN16-1",ten:"Cụm bu lông lắp khung phụ",dv:"Cái",dm:2,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-028",gc:""},
  {stt:63,id:"KL2812 703MN16-1L",ten:"Tấm đai ốc đoạn sau dầm dọc sàn trước",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-029",gc:""},
  {stt:64,id:"KL5120 101MN16-1",ten:"Tấm sàn phía trước",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-030",gc:""},
  {stt:65,id:"KL5120 105MN16-1L",ten:"Tấm tăng cứng cần số",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-031",gc:""},
  {stt:66,id:"KL5120 107MN16-1L",ten:"Tấm tăng cứng cột lái",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-032",gc:""},
  {stt:67,id:"KL5120 201MN16-1L",ten:"Giá đỡ lắp mô-đun túi khí sàn trước",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-033",gc:""},
  {stt:68,id:"KL5301 101MN16-1L",ten:"Đoạn trái tấm vách trước",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-034",gc:""},
  {stt:69,id:"KL5301 102MN16-1",ten:"Đoạn phải tấm vách trước",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-035",gc:""},
  {stt:70,id:"KL5301 103MN16-1",ten:"Đoạn giữa tấm vách trước",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-036",gc:""},
  {stt:71,id:"KL5301 105MN16-1",ten:"Tấm gia cường tấm vách trước",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-037",gc:""},
  {stt:72,id:"KL5301 117MN16-1L",ten:"Tấm trong dầm ngang trên kính chắn gió trước",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-038",gc:""},
  {stt:73,id:"KL5301 121MN16-1",ten:"Tấm gia cường tấm trong dầm ngang trên kính",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc trước",vt:"SM1-039",gc:""},
  {stt:74,id:"Q199B0520",ten:"Bu lông hàn M5x20",dv:"Cái",dm:57,dmuc:"Bu lông - Đai ốc",vt:"SM1-040",gc:""},
  {stt:75,id:"Q199B0620",ten:"Bu lông hàn đính M6x20",dv:"Cái",dm:2,dmuc:"Bu lông - Đai ốc",vt:"SM1-041",gc:""},
  {stt:76,id:"Q3720615",ten:"Đai ốc tán rive lục giác đầu bằng M6",dv:"Cái",dm:56,dmuc:"Bu lông - Đai ốc",vt:"SM1-042",gc:""},
  {stt:77,id:"KL2801 105MN16-1L",ten:"Đoạn trước bên trái dầm dọc sàn sau",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc sau",vt:"SM2-001",gc:""},
  {stt:78,id:"KL2801 106MN16-1L",ten:"Đoạn trước bên phải dầm dọc sàn sau",dv:"Cái",dm:1,dmuc:"Cụm mini - Dầm dọc sau",vt:"SM2-002",gc:""},
  {stt:79,id:"KL2801 107MN16-1",ten:"Đoạn sau dầm dọc sàn sau",dv:"Cái",dm:2,dmuc:"Cụm mini - Dầm dọc sau",vt:"SM2-003",gc:""},
  {stt:80,id:"KL2801 193MN16-1L",ten:"Tấm gia cường dầm dọc sàn sau",dv:"Cái",dm:2,dmuc:"Cụm mini - Dầm dọc sau",vt:"SM2-004",gc:""},
  {stt:81,id:"KL2801 195MN16-1L",ten:"Tấm bổ cường tấm gia cường dầm dọc sàn sau",dv:"Cái",dm:2,dmuc:"Cụm mini - Dầm dọc sau",vt:"SM2-005",gc:""},
  {stt:82,id:"KL2801 270MN16-1",ten:"Cụm hàn giá đỡ hỗ trợ IV tấm gia cường",dv:"Cái",dm:2,dmuc:"Cụm mini - Dầm dọc sau",vt:"SM2-006",gc:""},
  {stt:83,id:"KL2801 301MN16-1",ten:"Tấm liên kết dầm dọc sàn sau",dv:"Cái",dm:2,dmuc:"Cụm mini - Dầm dọc sau",vt:"SM2-007",gc:""},
  {stt:84,id:"KL2801 305MN16-1L",ten:"Tấm gia cường tấm liên kết dầm dọc sàn sau",dv:"Cái",dm:2,dmuc:"Cụm mini - Dầm dọc sau",vt:"SM2-008",gc:""},
  {stt:85,id:"KL2801 330MN16-1",ten:"Cụm hàn giá đỡ hỗ trợ tấm gia cường",dv:"Cái",dm:2,dmuc:"Cụm mini - Dầm dọc sau",vt:"SM2-009",gc:""},
  {stt:86,id:"KL2801 407MN16-1",ten:"Tấm gia cường III đoạn sau dầm dọc sàn sau",dv:"Cái",dm:2,dmuc:"Cụm mini - Dầm dọc sau",vt:"SM2-010",gc:""},
  {stt:87,id:"KL2801 501MN16-1L",ten:"Tấm gia cường II đoạn trước dầm dọc sàn sau",dv:"Cái",dm:4,dmuc:"Cụm mini - Dầm dọc sau",vt:"SM2-011",gc:""},
  {stt:88,id:"KL2801 700MN16-1",ten:"Cụm hàn giá đỡ lắp ghế I",dv:"Cái",dm:12,dmuc:"Cụm mini - Dầm dọc sau",vt:"SM2-012",gc:""},
  {stt:89,id:"KL2801 900MN16-1",ten:"Cụm hàn tấm liên kết đoạn sau dầm dọc sàn sau",dv:"Cái",dm:2,dmuc:"Cụm mini - Dầm dọc sau",vt:"SM2-013",gc:""},
];

const BOM_MB2 = [
  {stt:1,id:"MB2-001",ten:"Cụm hàn dầm chống va sau Minibus 2",dv:"Cái",dm:1,dmuc:"Cụm hàn chính",vt:"MB2-A1-001",gc:""},
  {stt:2,id:"MB2-002",ten:"Cụm hàn thành bên trái Minibus 2",dv:"Cái",dm:1,dmuc:"Cụm hàn chính",vt:"MB2-A1-002",gc:""},
  {stt:3,id:"MB2-003",ten:"Cụm hàn thành bên phải Minibus 2",dv:"Cái",dm:1,dmuc:"Cụm hàn chính",vt:"MB2-A1-003",gc:""},
  {stt:4,id:"MB2-004",ten:"Cụm dầm ngang nóc xe Minibus 2",dv:"Cái",dm:3,dmuc:"Cụm hàn chính",vt:"MB2-A1-004",gc:""},
  {stt:5,id:"MB2-005",ten:"Cụm hàn sàn trước Minibus 2",dv:"Cái",dm:1,dmuc:"Cụm hàn chính",vt:"MB2-A1-005",gc:""},
  {stt:6,id:"MB2-006",ten:"Cụm hàn sàn sau Minibus 2",dv:"Cái",dm:1,dmuc:"Cụm hàn chính",vt:"MB2-A1-006",gc:""},
  {stt:7,id:"MB2-007",ten:"Cụm cửa trước bên trái Minibus 2",dv:"Cái",dm:1,dmuc:"Cụm cửa",vt:"MB2-B1-001",gc:""},
  {stt:8,id:"MB2-008",ten:"Cụm cửa trước bên phải Minibus 2",dv:"Cái",dm:1,dmuc:"Cụm cửa",vt:"MB2-B1-002",gc:""},
  {stt:9,id:"MB2-009",ten:"Cụm cửa trượt giữa Minibus 2",dv:"Cái",dm:1,dmuc:"Cụm cửa",vt:"MB2-B1-003",gc:""},
  {stt:10,id:"MB2-010",ten:"Cụm cửa hậu Minibus 2",dv:"Cái",dm:1,dmuc:"Cụm cửa",vt:"MB2-B1-004",gc:"Cửa 2 cánh"},
  {stt:11,id:"MB2-011",ten:"Dầm dọc sàn trước trái Minibus 2",dv:"Cái",dm:1,dmuc:"Dầm dọc - Ngang",vt:"MB2-C1-001",gc:""},
  {stt:12,id:"MB2-012",ten:"Dầm dọc sàn trước phải Minibus 2",dv:"Cái",dm:1,dmuc:"Dầm dọc - Ngang",vt:"MB2-C1-002",gc:""},
  {stt:13,id:"MB2-013",ten:"Dầm dọc sàn sau trái Minibus 2",dv:"Cái",dm:1,dmuc:"Dầm dọc - Ngang",vt:"MB2-C1-003",gc:""},
  {stt:14,id:"MB2-014",ten:"Dầm dọc sàn sau phải Minibus 2",dv:"Cái",dm:1,dmuc:"Dầm dọc - Ngang",vt:"MB2-C1-004",gc:""},
  {stt:15,id:"MB2-015",ten:"Dầm ngang trước sàn Minibus 2",dv:"Cái",dm:1,dmuc:"Dầm dọc - Ngang",vt:"MB2-C2-001",gc:""},
  {stt:16,id:"MB2-016",ten:"Dầm ngang giữa sàn Minibus 2",dv:"Cái",dm:2,dmuc:"Dầm dọc - Ngang",vt:"MB2-C2-002",gc:""},
  {stt:17,id:"MB2-017",ten:"Dầm ngang sau sàn Minibus 2",dv:"Cái",dm:1,dmuc:"Dầm dọc - Ngang",vt:"MB2-C2-003",gc:""},
  {stt:18,id:"MB2-018",ten:"Cụm hàn dầm chống va trước Minibus 2",dv:"Cái",dm:1,dmuc:"Dầm dọc - Ngang",vt:"MB2-C3-001",gc:""},
  {stt:19,id:"MB2-019",ten:"Cụm nắp capo động cơ Minibus 2",dv:"Cái",dm:1,dmuc:"Ngoại thất",vt:"MB2-D1-001",gc:""},
  {stt:20,id:"MB2-020",ten:"Cụm chắn bùn bánh trước trái Minibus 2",dv:"Cái",dm:1,dmuc:"Ngoại thất",vt:"MB2-D1-002",gc:""},
  {stt:21,id:"MB2-021",ten:"Cụm chắn bùn bánh trước phải Minibus 2",dv:"Cái",dm:1,dmuc:"Ngoại thất",vt:"MB2-D1-003",gc:""},
  {stt:22,id:"MB2-022",ten:"Cụm vè bánh trước trái Minibus 2",dv:"Cái",dm:1,dmuc:"Ngoại thất",vt:"MB2-D1-004",gc:""},
  {stt:23,id:"MB2-023",ten:"Cụm vè bánh trước phải Minibus 2",dv:"Cái",dm:1,dmuc:"Ngoại thất",vt:"MB2-D1-005",gc:""},
  {stt:24,id:"MB2-024",ten:"Tấm vách ngăn trước Minibus 2",dv:"Cái",dm:1,dmuc:"Vách ngăn",vt:"MB2-E1-001",gc:""},
  {stt:25,id:"MB2-025",ten:"Tấm vách ngăn buồng lái Minibus 2",dv:"Cái",dm:1,dmuc:"Vách ngăn",vt:"MB2-E1-002",gc:""},
  {stt:26,id:"MB2-026",ten:"Tấm sàn trước Minibus 2",dv:"Cái",dm:1,dmuc:"Sàn xe",vt:"MB2-F1-001",gc:""},
  {stt:27,id:"MB2-027",ten:"Tấm sàn giữa Minibus 2",dv:"Cái",dm:1,dmuc:"Sàn xe",vt:"MB2-F1-002",gc:""},
  {stt:28,id:"MB2-028",ten:"Tấm sàn sau Minibus 2",dv:"Cái",dm:1,dmuc:"Sàn xe",vt:"MB2-F1-003",gc:""},
  {stt:29,id:"MB2-029",ten:"Bu lông M6x16 Minibus 2",dv:"Cái",dm:48,dmuc:"Bu lông - Đai ốc",vt:"MB2-G1-001",gc:""},
  {stt:30,id:"MB2-030",ten:"Bu lông M8x20 Minibus 2",dv:"Cái",dm:36,dmuc:"Bu lông - Đai ốc",vt:"MB2-G1-002",gc:""},
  {stt:31,id:"MB2-031",ten:"Bu lông M10x30 Minibus 2",dv:"Cái",dm:24,dmuc:"Bu lông - Đai ốc",vt:"MB2-G1-003",gc:""},
  {stt:32,id:"MB2-032",ten:"Đai ốc M6 + vòng đệm Minibus 2",dv:"Bộ",dm:48,dmuc:"Bu lông - Đai ốc",vt:"MB2-G2-001",gc:""},
  {stt:33,id:"MB2-033",ten:"Đai ốc M8 + vòng đệm Minibus 2",dv:"Bộ",dm:36,dmuc:"Bu lông - Đai ốc",vt:"MB2-G2-002",gc:""},
  {stt:34,id:"MB2-034",ten:"Bu lông hàn M5x20 Minibus 2",dv:"Cái",dm:120,dmuc:"Bu lông - Đai ốc",vt:"MB2-G3-001",gc:""},
  {stt:35,id:"MB2-035",ten:"Đai ốc tán rive M6 Minibus 2",dv:"Cái",dm:80,dmuc:"Bu lông - Đai ốc",vt:"MB2-G3-002",gc:""},
  {stt:36,id:"MB2-036",ten:"Giá đỡ ghế hành khách hàng 1",dv:"Cái",dm:4,dmuc:"Ghế - Nội thất",vt:"MB2-H1-001",gc:"4 ghế hàng 1"},
  {stt:37,id:"MB2-037",ten:"Giá đỡ ghế hành khách hàng 2",dv:"Cái",dm:4,dmuc:"Ghế - Nội thất",vt:"MB2-H1-002",gc:"4 ghế hàng 2"},
  {stt:38,id:"MB2-038",ten:"Giá đỡ ghế hành khách hàng 3",dv:"Cái",dm:4,dmuc:"Ghế - Nội thất",vt:"MB2-H1-003",gc:"4 ghế hàng 3"},
  {stt:39,id:"MB2-039",ten:"Dầm lắp ghế dọc theo sàn Minibus 2",dv:"Cái",dm:2,dmuc:"Ghế - Nội thất",vt:"MB2-H2-001",gc:""},
];

const SEED = {proj_xh: BOM_XH, proj_mb2: BOM_MB2};
const PROJS_DEF = [
  {id:"proj_xh", ten:"Xưởng Hàn", mo_ta:"BOM Xưởng Hàn · Nhà Máy Bus", mau:"#1d4ed8", icon:"🔧", so_xe:1},
  {id:"proj_mb2",ten:"Minibus 2",  mo_ta:"BOM Minibus 2 · Nhà Máy Bus",  mau:"#b45309", icon:"🚌", so_xe:1},
];
let _n=0; const uid=()=>`id${++_n}`;
const mkBom=(pid,arr)=>arr.map(v=>({id:uid(),pid,stt:v.stt,ma:v.id,ten:v.ten,dv:v.dv,dm:v.dm,dmuc:v.dmuc,vt:v.vt,gc:v.gc,anh:""}));
const initBom={};
PROJS_DEF.forEach(p=>{initBom[p.id]=mkBom(p.id,SEED[p.id]||[]);});

// ═══════════════════════════════════════════════════════════════
//  USERS & AUTH
// ═══════════════════════════════════════════════════════════════
const USERS_DEF = [
  {id:"admin",  ten:"Quản trị viên", pw:"thck2024", role:"thck",     don_vi:"Nhà máy THCK", avatar:"🏭", mau:"#1d4ed8"},
  {id:"thck01", ten:"Nguyễn Văn An", pw:"thck01",   role:"thck",     don_vi:"Nhà máy THCK", avatar:"👤", mau:"#1d4ed8"},
  {id:"thck02", ten:"Trần Thị Bích", pw:"thck02",   role:"thck",     don_vi:"Nhà máy THCK", avatar:"👤", mau:"#1d4ed8"},
  {id:"xh01",   ten:"Lê Văn Cường",  pw:"xh01",     role:"xuonghan", don_vi:"Xưởng Hàn",    avatar:"🔧", mau:"#b45309"},
  {id:"xh02",   ten:"Phạm Thị Dung", pw:"xh02",     role:"xuonghan", don_vi:"Xưởng Hàn",    avatar:"🔧", mau:"#b45309"},
  {id:"xh03",   ten:"Hoàng Văn Em",  pw:"xh03",     role:"xuonghan", don_vi:"Xưởng Hàn",    avatar:"🔧", mau:"#b45309"},
];

// Cả 2 role đều thấy đủ tabs — chỉ khác quyền hành động
// THCK  → Soạn hàng, tạo phiếu, gửi đơn (KHÔNG xác nhận/duyệt)
// XH    → Xem phiếu, xác nhận, duyệt, quản lý BOM, người dùng
const TABS_ALL = [
  ["ds",    "📦 Vật tư"],
  ["soan",  "📋 Soạn Hàng"],
  ["pgn",   "📄 Phiếu GN"],
  ["bc",    "📈 Báo Cáo"],
  ["ls",    "🕓 Lịch sử"],
  ["tk",    "📊 Thống kê"],
  ["users", "👥 Người dùng"],
];
const TABS_THCK     = TABS_ALL.filter(([k])=>k!=="users");
const TABS_XUONGHAN = TABS_ALL;

// ─── Login Screen — 1 biểu mẫu dùng chung ────────────────────
function LoginScreen({onLogin}){
  const [uid2,  setUid2]  = useState("");
  const [pw,    setPw]    = useState("");
  const [err,   setErr]   = useState("");
  const [showPw,setShowPw]= useState(false);
  const [userList,setUserList]=useState(USERS_DEF);

  const si={width:"100%",padding:"11px 14px",border:"1px solid rgba(255,255,255,0.18)",borderRadius:9,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit",background:"rgba(255,255,255,0.09)",color:"#fff"};

  useEffect(()=>{
    supabase.from("users").select("*").then(({data})=>{
      if(data?.length) setUserList(data);
    });
  },[]);

  const selUser = userList.find(u=>u.id===uid2);

  const handleLogin=()=>{
    if(!uid2){setErr("Vui lòng chọn tài khoản!");return;}
    const u=userList.find(u=>u.id===uid2&&u.pw===pw);
    if(!u){setErr("Mật khẩu không đúng!");return;}
    setErr("");onLogin(u,userList);
  };

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e293b 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Segoe UI',system-ui,sans-serif"}}>

      {/* Logo */}
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontSize:56,marginBottom:10,filter:"drop-shadow(0 4px 16px rgba(59,130,246,0.5))"}}>🏭</div>
        <div style={{fontSize:22,fontWeight:800,color:"#fff",letterSpacing:.3}}>Quản Lý Vật Tư BOM</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:5}}>Hệ thống quản lý vật tư xưởng hàn xe buýt</div>
      </div>

      {/* Card */}
      <div style={{width:"100%",maxWidth:400,background:"rgba(255,255,255,0.06)",backdropFilter:"blur(12px)",borderRadius:20,padding:"32px 28px",border:"1px solid rgba(255,255,255,0.12)",boxShadow:"0 24px 64px rgba(0,0,0,0.5)"}}>
        <div style={{fontSize:16,fontWeight:700,color:"#fff",marginBottom:22,textAlign:"center"}}>Đăng nhập hệ thống</div>

        {/* Tài khoản */}
        <div style={{marginBottom:16}}>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",marginBottom:7,letterSpacing:.8,textTransform:"uppercase"}}>Tài khoản</label>
          <select value={uid2} onChange={e=>{setUid2(e.target.value);setErr("");setPw("");}} style={si}>
            <option value="" style={{background:"#1e3a5f"}}>-- Chọn tài khoản --</option>
            <optgroup label="🏭 Nhà máy THCK" style={{background:"#1e3a5f"}}>
              {userList.filter(u=>u.role==="thck").map(u=>(
                <option key={u.id} value={u.id} style={{background:"#1e3a5f"}}>{u.avatar} {u.ten} ({u.id})</option>
              ))}
            </optgroup>
            <optgroup label="🔧 Xưởng Hàn" style={{background:"#1e3a5f"}}>
              {userList.filter(u=>u.role==="xuonghan").map(u=>(
                <option key={u.id} value={u.id} style={{background:"#1e3a5f"}}>{u.avatar} {u.ten} ({u.id})</option>
              ))}
            </optgroup>
          </select>
          {/* Badge đơn vị */}
          {selUser&&(
            <div style={{marginTop:8,display:"flex",alignItems:"center",gap:8,padding:"7px 12px",borderRadius:8,background:selUser.role==="thck"?"rgba(29,78,216,0.2)":"rgba(180,83,9,0.2)",border:`1px solid ${selUser.role==="thck"?"rgba(147,197,253,0.3)":"rgba(253,186,116,0.3)"}`}}>
              <span style={{fontSize:18}}>{selUser.avatar}</span>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>{selUser.ten}</div>
                <div style={{fontSize:10,color:selUser.role==="thck"?"#93c5fd":"#fed7aa"}}>{selUser.don_vi} · {selUser.role==="thck"?"Soạn hàng · Lập phiếu giao":"Kiểm tra · Xác nhận · Quản lý"}</div>
              </div>
            </div>
          )}
        </div>

        {/* Mật khẩu */}
        <div style={{marginBottom:22}}>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",marginBottom:7,letterSpacing:.8,textTransform:"uppercase"}}>Mật khẩu</label>
          <div style={{position:"relative"}}>
            <input type={showPw?"text":"password"} value={pw}
              onChange={e=>{setPw(e.target.value);setErr("");}}
              onKeyDown={e=>e.key==="Enter"&&handleLogin()}
              placeholder="Nhập mật khẩu..."
              style={{...si,paddingRight:46}}/>
            <button onClick={()=>setShowPw(s=>!s)}
              style={{position:"absolute",right:13,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"rgba(255,255,255,0.35)",cursor:"pointer",fontSize:16,padding:0,lineHeight:1}}>
              {showPw?"🙈":"👁"}
            </button>
          </div>
        </div>

        {/* Error */}
        {err&&(
          <div style={{background:"rgba(220,38,38,0.18)",border:"1px solid rgba(239,68,68,0.4)",borderRadius:8,padding:"9px 13px",fontSize:12,color:"#fca5a5",marginBottom:16,display:"flex",alignItems:"center",gap:6}}>
            ⚠️ {err}
          </div>
        )}

        {/* Button đăng nhập */}
        <button onClick={handleLogin}
          style={{width:"100%",padding:"13px",background:selUser?.role==="xuonghan"?"linear-gradient(135deg,#b45309,#d97706)":"linear-gradient(135deg,#1d4ed8,#3b82f6)",border:"none",borderRadius:10,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",boxShadow:selUser?.role==="xuonghan"?"0 4px 20px rgba(180,83,9,0.5)":"0 4px 20px rgba(29,78,216,0.5)",transition:"opacity .15s"}}
          onMouseOver={e=>e.currentTarget.style.opacity=".88"}
          onMouseOut={e=>e.currentTarget.style.opacity="1"}>
          Đăng nhập →
        </button>

        {/* Tài khoản demo */}
        <div style={{marginTop:20,borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:16}}>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",fontWeight:700,letterSpacing:.8,textTransform:"uppercase",marginBottom:8}}>Tài khoản demo</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
            {userList.map(u=>(
              <div key={u.id} onClick={()=>{setUid2(u.id);setPw(u.pw);setErr("");}}
                style={{padding:"5px 8px",borderRadius:6,background:"rgba(255,255,255,0.04)",cursor:"pointer",border:"1px solid rgba(255,255,255,0.06)",transition:"background .1s"}}
                onMouseOver={e=>e.currentTarget.style.background="rgba(255,255,255,0.09)"}
                onMouseOut={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"}>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",fontWeight:600}}>{u.avatar} {u.id}</div>
                <div style={{fontSize:10,color:u.role==="thck"?"#93c5fd":"#fed7aa"}}>{u.don_vi}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Users Management Panel ────────────────────────────────────
function UsersPanel({currentUser, users, setUsers, dbUpsertUser, dbDeleteUser}){
  const [form, setForm]   = useState({id:"",ten:"",pw:"",role:"xuonghan",don_vi:"Xưởng Hàn",avatar:"🔧"});
  const [editing,setEdit] = useState(null);
  const [flash2, setFlash2]= useState("");
  const inp={width:"100%",padding:"8px 10px",border:"1px solid #d1d5db",borderRadius:6,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit"};
  const btn={border:"none",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:12,padding:"5px 11px"};
  const fl=m=>{setFlash2(m);setTimeout(()=>setFlash2(""),2500);};

  const save=()=>{
    if(!form.id.trim()||!form.ten.trim()||!form.pw.trim()){fl("⚠️ Điền đủ thông tin!");return;}
    if(editing){
      setUsers(l=>l.map(u=>u.id===editing?{...u,...form}:u));
      dbUpsertUser&&dbUpsertUser({...form});
      fl("✓ Đã cập nhật");
    } else {
      if(users.find(u=>u.id===form.id)){fl("⚠️ ID đã tồn tại!");return;}
      setUsers(l=>[...l,{...form}]);
      dbUpsertUser&&dbUpsertUser({...form});
      fl("✓ Đã thêm tài khoản");
    }
    setForm({id:"",ten:"",pw:"",role:"xuonghan",don_vi:"Xưởng Hàn",avatar:"🔧"});setEdit(null);
  };
  const del=id=>{
    if(id===currentUser.id){fl("⚠️ Không thể xóa tài khoản đang dùng!");return;}
    if(!window.confirm("Xóa tài khoản này?"))return;
    setUsers(l=>l.filter(u=>u.id!==id));
    dbDeleteUser&&dbDeleteUser(id);
    fl("✓ Đã xóa");
  };
  const startEdit=u=>{setForm({...u});setEdit(u.id);};
  const resetForm=()=>{setForm({id:"",ten:"",pw:"",role:"xuonghan",don_vi:"Xưởng Hàn",avatar:"🔧"});setEdit(null);};

  return(
    <div>
      <div style={{background:"#fff",borderRadius:10,padding:"16px 18px",marginBottom:16,boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:14,color:"#1f2937"}}>{editing?"✏️ Cập nhật tài khoản":"➕ Thêm tài khoản mới"}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:12}}>
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>ID đăng nhập *</label>
            <input value={form.id} onChange={e=>setForm(f=>({...f,id:e.target.value.toLowerCase().replace(/\s/g,"")}))} disabled={!!editing}
              style={{...inp,background:editing?"#f9fafb":"#fff",color:editing?"#9ca3af":"inherit"}} placeholder="xh04"/>
          </div>
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Họ tên *</label>
            <input value={form.ten} onChange={e=>setForm(f=>({...f,ten:e.target.value}))} style={inp} placeholder="Nguyễn Văn A"/>
          </div>
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Mật khẩu *</label>
            <input value={form.pw} onChange={e=>setForm(f=>({...f,pw:e.target.value}))} style={inp} placeholder="Mật khẩu"/>
          </div>
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Vai trò</label>
            <select value={form.role} onChange={e=>{const r=e.target.value;setForm(f=>({...f,role:r,don_vi:r==="thck"?"Nhà máy THCK":"Xưởng Hàn",avatar:r==="thck"?"🏭":"🔧"}));}} style={inp}>
              <option value="thck">🏭 Nhà máy THCK</option>
              <option value="xuonghan">🔧 Xưởng Hàn</option>
            </select>
          </div>
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Avatar</label>
            <select value={form.avatar} onChange={e=>setForm(f=>({...f,avatar:e.target.value}))} style={inp}>
              {["👤","🧑","👩","🏭","🔧","👷","👨‍🔧","👩‍🔧","⚙️","🛠️"].map(a=><option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:12,color:flash2.startsWith("⚠️")?"#dc2626":"#16a34a",minWidth:160}}>{flash2}</span>
          <div style={{marginLeft:"auto",display:"flex",gap:8}}>
            {editing&&<button onClick={resetForm} style={{...btn,background:"#f3f4f6",color:"#374151",padding:"7px 14px"}}>Hủy</button>}
            <button onClick={save} style={{...btn,background:"#1d4ed8",color:"#fff",padding:"7px 18px",fontSize:13}}>{editing?"Lưu cập nhật":"Thêm tài khoản"}</button>
          </div>
        </div>
      </div>

      {[{role:"thck",label:"🏭 Nhà máy THCK",mau:"#1d4ed8"},{role:"xuonghan",label:"🔧 Xưởng Hàn",mau:"#b45309"}].map(grp=>{
        const grpList=users.filter(u=>u.role===grp.role);
        return(
          <div key={grp.role} style={{background:"#fff",borderRadius:10,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.08)",marginBottom:12}}>
            <div style={{padding:"10px 16px",borderBottom:"1px solid #e5e7eb",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:10,background:"#f8fafc"}}>
              <span>{grp.label}</span>
              <span style={{background:grp.mau,color:"#fff",borderRadius:20,padding:"2px 10px",fontSize:11}}>{grpList.length} tài khoản</span>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr style={{background:"#f8fafc",borderBottom:"1px solid #e5e7eb"}}>
                  {["","ID","Họ tên","Đơn vị","Mật khẩu","",""].map((h,i)=><th key={i} style={{padding:"8px 12px",textAlign:"left",fontWeight:700,color:"#6b7280",fontSize:11}}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {grpList.map((u,i)=>(
                    <tr key={u.id} style={{borderBottom:"1px solid #f1f5f9",background:u.id===currentUser.id?"#eff6ff":i%2===0?"#fff":"#f9fafb"}}>
                      <td style={{padding:"8px 12px",fontSize:20,width:40}}>{u.avatar}</td>
                      <td style={{padding:"8px 12px",fontWeight:700,color:grp.mau,fontFamily:"monospace"}}>{u.id}</td>
                      <td style={{padding:"8px 12px",fontWeight:600}}>{u.ten}{u.id===currentUser.id&&<span style={{background:"#d1fae5",color:"#065f46",borderRadius:10,padding:"1px 8px",fontSize:10,marginLeft:6,fontWeight:700}}>Đang dùng</span>}</td>
                      <td style={{padding:"8px 12px",color:"#6b7280"}}>{u.don_vi}</td>
                      <td style={{padding:"8px 12px",fontFamily:"monospace",fontSize:11,color:"#9ca3af"}}>{"•".repeat(Math.min(u.pw.length,8))}</td>
                      <td style={{padding:"8px 12px"}}><button onClick={()=>startEdit(u)} style={{...btn,background:"#fef3c7",color:"#92400e"}}>Sửa</button></td>
                      <td style={{padding:"8px 12px"}}><button onClick={()=>del(u.id)} disabled={u.id===currentUser.id} style={{...btn,background:u.id===currentUser.id?"#f3f4f6":"#fee2e2",color:u.id===currentUser.id?"#9ca3af":"#991b1b"}}>Xóa</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const fmt=n=>(n||0).toLocaleString("vi-VN");
const E0={stt:0,ma:"",ten:"",dv:"Cái",dm:1,dmuc:"",vt:"",gc:"",anh:""};

function AnhModal({src,onClose}){
  if(!src)return null;
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3000,cursor:"zoom-out"}}>
      <img src={src} alt="" style={{maxWidth:"90vw",maxHeight:"90vh",borderRadius:8}} onClick={e=>e.stopPropagation()}/>
      <button onClick={onClose} style={{position:"absolute",top:16,right:20,background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",fontSize:22,cursor:"pointer",borderRadius:"50%",width:36,height:36}}>✕</button>
    </div>
  );
}

function Prog({p,done,h=8}){
  const c=done?"#16a34a":p>60?"#f59e0b":"#ef4444";
  return(
    <div style={{flex:1,height:h,background:"#e5e7eb",borderRadius:99,overflow:"hidden"}}>
      <div style={{width:`${p}%`,height:"100%",background:c,borderRadius:99,transition:"width .3s"}}/>
    </div>
  );
}

export default function App(){
  const I=S=>S.inp; // shorthand for style
  const B=S=>S.btn;

  const inp={width:"100%",padding:"7px 10px",border:"1px solid #d1d5db",borderRadius:6,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit"};
  const btn={border:"none",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:12,padding:"5px 11px"};

  // ── State ──
  const [user,     setUser]     = useState(null);   // logged-in user
  const [users,    setUsers]    = useState(USERS_DEF);
  const [projs,    setProjs]    = useState(PROJS_DEF);
  const [bomDB,    setBomDB]    = useState(initBom);
  const [lsDB,     setLsDB]     = useState({});
  const [phDB,     setPhDB]     = useState({});
  const [soanDB,   setSoanDB]   = useState({});
  const [pid,      setPid]      = useState("proj_xh");
  const [tab,      setTab]      = useState("ds");
  const [search,   setSearch]   = useState("");
  const [fdm,      setFdm]      = useState("Tất cả");
  const [sCol,     setSCol]     = useState("stt");
  const [sAsc,     setSAsc]     = useState(true);
  const [modal,    setModal]    = useState(null);
  const [cur,      setCur]      = useState(E0);
  const [anhPv,    setAnhPv]    = useState(null);
  const [slXT,     setSlXT]     = useState(1);
  const [gcXT,     setGcXT]     = useState("");
  const [newP,     setNewP]     = useState(false);
  const [nPF,      setNPF]      = useState({ten:"",moTa:"",mau:"#7c3aed",icon:"📦",so_xe:1,bom:"trong"});
  const [msg,      setMsg]      = useState("");
  const [showPh,   setShowPh]   = useState(false);
  const [viewPh,   setViewPh]   = useState(null);
  const [phF,      setPhF]      = useState({sp:"",ngay:new Date().toISOString().slice(0,10),gc:""});
  const [phIt,     setPhIt]     = useState([]);
  const [addIt,    setAddIt]    = useState({ma:"",sl:1});
  const [bcFlt,    setBcFlt]    = useState("all");
  const [bcExp,    setBcExp]    = useState({});
  const [bcDmO,    setBcDmO]    = useState({});
  const [pgnSr,    setPgnSr]    = useState("");
  const [pgnDm,    setPgnDm]    = useState("Tất cả");
  const [pgnSO,    setPgnSO]    = useState("all");
  const fRef=useRef();

  // ── Load dữ liệu từ Supabase khi khởi động ──
  useEffect(()=>{
    const load=async()=>{
      try{
        const [{data:usersData},{data:projsData},{data:bomData},{data:phieuData},{data:phCtData},{data:lsData}]=await Promise.all([
          supabase.from("users").select("*"),
          supabase.from("projects").select("*"),
          supabase.from("bom_items").select("*"),
          supabase.from("phieu").select("*").order("ts",{ascending:false}),
          supabase.from("phieu_ct").select("*"),
          supabase.from("lich_su").select("*").order("ts",{ascending:false}).limit(500),
        ]);
        if(usersData?.length) setUsers(usersData);
        if(projsData?.length){
          setProjs(projsData);
          setPid(projsData[0].id);
        }
        if(bomData?.length){
          const grouped={};
          bomData.forEach(v=>{if(!grouped[v.pid])grouped[v.pid]=[];grouped[v.pid].push(v);});
          setBomDB(grouped);
        }
        if(phieuData?.length){
          const ctMap={};
          (phCtData||[]).forEach(c=>{if(!ctMap[c.phid])ctMap[c.phid]=[];ctMap[c.phid].push(c);});
          const grouped={};
          phieuData.forEach(p=>{
            const ph={...p,ct:ctMap[p.id]||[]};
            if(!grouped[p.pid])grouped[p.pid]=[];
            grouped[p.pid].push(ph);
          });
          setPhDB(grouped);
        }
        if(lsData?.length){
          const grouped={};
          lsData.forEach(v=>{if(!grouped[v.pid])grouped[v.pid]=[];grouped[v.pid].push(v);});
          setLsDB(grouped);
        }
      }catch(e){console.error("Supabase load error:",e);}
    };
    load();
  },[]);

  // ── Supabase write helpers ──
  const dbUpsertBom=async(pid,rows)=>{
    try{
      await supabase.from("bom_items").delete().eq("pid",pid);
      if(rows.length) await supabase.from("bom_items").insert(rows.map(r=>({...r,pid})));
    }catch(e){console.error("dbUpsertBom:",e);}
  };
  const dbUpsertProj=async(p)=>{
    try{await supabase.from("projects").upsert(p);}catch(e){console.error("dbUpsertProj:",e);}
  };
  const dbDeleteProj=async(id)=>{
    try{await supabase.from("projects").delete().eq("id",id);}catch(e){console.error("dbDeleteProj:",e);}
  };
  const dbSavePhieu=async(ph)=>{
    try{
      const {ct,...phData}=ph;
      await supabase.from("phieu").upsert(phData);
      if(ct?.length) await supabase.from("phieu_ct").upsert(ct);
    }catch(e){console.error("dbSavePhieu:",e);}
  };
  const dbAddLS=async(row)=>{
    try{await supabase.from("lich_su").insert(row);}catch(e){console.error("dbAddLS:",e);}
  };
  const dbUpdatePhieuCt=async(ctid,ok)=>{
    try{await supabase.from("phieu_ct").update({ok}).eq("id",ctid);}catch(e){console.error("dbUpdatePhieuCt:",e);}
  };
  const dbUpdatePhieuTt=async(phid,tt)=>{
    try{await supabase.from("phieu").update({tt}).eq("id",phid);}catch(e){console.error("dbUpdatePhieuTt:",e);}
  };
  const dbUpsertUser=async(u)=>{
    try{await supabase.from("users").upsert(u);}catch(e){console.error("dbUpsertUser:",e);}
  };
  const dbDeleteUser=async(id)=>{
    try{await supabase.from("users").delete().eq("id",id);}catch(e){console.error("dbDeleteUser:",e);}
  };

  // ── Derived ──
  const bom   = bomDB[pid]  || [];
  const ls    = lsDB[pid]   || [];
  const phList= phDB[pid]   || [];
  const soan  = soanDB[pid] || {};
  const proj  = projs.find(p=>p.id===pid) || projs[0] || {mau:"#1d4ed8",icon:"📦",ten:"",so_xe:1};
  const soXe  = proj.so_xe||1;
  const DMS   = [...new Set(bom.map(v=>v.dmuc).filter(Boolean))].sort();
  const soaned= Object.values(soan).filter(x=>x.on).length;

  // ── Helpers ──
  const flash=m=>{setMsg(m);setTimeout(()=>setMsg(""),2500);};
  const addLS=(p2,r)=>setLsDB(s=>({...s,[p2]:[{id:uid(),ts:new Date().toISOString(),...r},...(s[p2]||[])].slice(0,200)}));
  const sw=useCallback(id=>{setPid(id);setSearch("");setFdm("Tất cả");setTab("ds");},[]);

  // ── BOM CRUD ──
  const save=()=>{
    if(!cur.ma.trim()||!cur.ten.trim())return;
    const edit=modal==="edit";
    setBomDB(s=>{
      const old=s[pid]||[];
      let next;
      if(edit) next={...s,[pid]:old.map(v=>v.ma===cur.ma?{...v,...cur}:v)};
      else{const ns=old.length?Math.max(...old.map(v=>v.stt))+1:1;next={...s,[pid]:[...old,{id:uid(),pid,stt:ns,...cur}]};}
      dbUpsertBom(pid,next[pid]);
      return next;
    });
    if(!edit)addLS(pid,{pid,ma:cur.ma,ten:cur.ten,loai:"Tạo mới",sl:cur.dm,gc:""});
    setModal(null);flash("✓ Đã lưu");
  };
  const del=v=>{
    if(!window.confirm(`Xóa "${v.ten}"?`))return;
    setBomDB(s=>{
      const next={...s,[pid]:(s[pid]||[]).filter(x=>x.ma!==v.ma)};
      dbUpsertBom(pid,next[pid]);
      return next;
    });
    flash("✓ Đã xóa");
  };
  const doIO=()=>{
    const loai=modal==="nhap"?"Nhập kho":"Xuất kho";
    const sl=parseInt(slXT)||1;
    const row={id:uid(),pid,ma:cur.ma,ten:cur.ten,loai,sl:modal==="nhap"?sl:-sl,gc:gcXT,ts:new Date().toISOString()};
    addLS(pid,row);
    dbAddLS(row);
    setModal(null);flash(`✓ ${loai} ${sl} ${cur.dv}`);
  };

  // ── Projects ──
  const mkProj=()=>{
    if(!nPF.ten.trim())return;
    const id="proj_"+Date.now();
    const p={id,ten:nPF.ten,mo_ta:nPF.moTa||nPF.ten,mau:nPF.mau,icon:nPF.icon,so_xe:parseInt(nPF.so_xe)||1};
    const seed=nPF.bom==="xh"?BOM_XH:nPF.bom==="mb2"?BOM_MB2:[];
    const bomRows=mkBom(id,seed);
    setProjs(ps=>[...ps,p]);
    setBomDB(s=>({...s,[id]:bomRows}));
    dbUpsertProj(p);
    dbUpsertBom(id,bomRows);
    setNewP(false);
    setNPF({ten:"",moTa:"",mau:"#7c3aed",icon:"📦",so_xe:1,bom:"trong"});
    setTimeout(()=>sw(id),0);
    flash(`✓ Tạo dự án thành công${bomRows.length?` (${bomRows.length} mã VT)`:""}`);
  };
  const delProj=id=>{
    if(projs.length<=1){alert("Phải có ít nhất 1 dự án!");return;}
    if(!window.confirm("Xóa dự án?"))return;
    setProjs(ps=>ps.filter(p=>p.id!==id));
    dbDeleteProj(id);
    const nid=projs.find(p=>p.id!==id)?.id;
    if(nid)sw(nid);
  };
  const editSoXe=()=>{
    const v=prompt("Số xe:",soXe);
    if(v&&!isNaN(v)&&Number(v)>0){
      setProjs(ps=>{
        const next=ps.map(p=>p.id===pid?{...p,so_xe:Math.round(Number(v))}:p);
        const updated=next.find(p=>p.id===pid);
        if(updated)dbUpsertProj(updated);
        return next;
      });
    }
  };

  const [showImport, setShowImport] = useState(false);
  const [importSrc,  setImportSrc]  = useState("xh");
  const [importMode, setImportMode] = useState("them"); // "them" | "thay"
  const [showXlsImport, setShowXlsImport] = useState(false);
  const [xlsPreview, setXlsPreview] = useState([]);
  const [xlsErr, setXlsErr] = useState("");
  const xlsRef = useRef();

  const doImport=()=>{
    const seed=importSrc==="xh"?BOM_XH:BOM_MB2;
    const rows=mkBom(pid,seed);
    setBomDB(s=>{
      const old=s[pid]||[];
      let next;
      if(importMode==="thay") next={...s,[pid]:rows};
      else{
        const existMa=new Set(old.map(v=>v.ma));
        const news=rows.filter(v=>!existMa.has(v.ma));
        const maxStt=old.length?Math.max(...old.map(v=>v.stt)):0;
        next={...s,[pid]:[...old,...news.map((v,i)=>({...v,stt:maxStt+i+1}))]};
      }
      dbUpsertBom(pid,next[pid]);
      return next;
    });
    setShowImport(false);
    flash(`✓ Import ${rows.length} mã từ ${importSrc==="xh"?"Xưởng Hàn":"Minibus 2"}`);
  };
  const handleXlsFile=e=>{
    const file=e.target.files[0];
    if(!file){return;}
    setXlsErr("");
    setXlsPreview([]);
    const name=file.name.toLowerCase();
    if(name.endsWith(".csv")){
      // CSV path
      const reader=new FileReader();
      reader.onload=ev=>{
        try{
          const text=ev.target.result;
          const lines=text.split(/\r?\n/).filter(l=>l.trim());
          if(lines.length<2){setXlsErr("File CSV trống!");return;}
          const headers=lines[0].split(",").map(h=>h.replace(/"/g,"").trim());
          const mapped=lines.slice(1).map((line,i)=>{
            const cols=line.split(",").map(c=>c.replace(/"/g,"").trim());
            const r={};
            headers.forEach((h,j)=>{r[h]=cols[j]||"";});
            return{
              stt:r["STT"]||r["stt"]||i+1,
              ma:String(r["Mã số"]||r["ma"]||r["MA"]||r["id"]||"").trim(),
              ten:String(r["Tên vật tư"]||r["ten"]||r["TEN"]||r["name"]||"").trim(),
              dv:String(r["ĐVT"]||r["dv"]||r["DV"]||"Cái").trim(),
              dm:Number(r["ĐM/1XE"]||r["ĐM"]||r["dm"]||r["DM"]||1),
              dmuc:String(r["Danh mục"]||r["dmuc"]||r["DMUC"]||"").trim(),
              vt:String(r["Vị trí"]||r["vt"]||r["VT"]||"").trim(),
              gc:String(r["Ghi chú"]||r["gc"]||r["GC"]||"").trim(),
            };
          }).filter(r=>r.ma&&r.ten);
          if(!mapped.length){setXlsErr("Không tìm thấy cột Mã số / Tên vật tư!");return;}
          setXlsPreview(mapped);
        }catch(err){setXlsErr("Lỗi đọc CSV: "+err.message);}
      };
      reader.readAsText(file,"UTF-8");
    } else {
      // XLSX/XLS path — dùng import động
      const reader=new FileReader();
      reader.onload=async ev=>{
        try{
          const {read,utils}=await import("xlsx");
          const wb=read(new Uint8Array(ev.target.result),{type:"array",cellText:false,cellDates:true});
          const ws=wb.Sheets[wb.SheetNames[0]];
          const rows=utils.sheet_to_json(ws,{defval:"",raw:false});
          if(!rows.length){setXlsErr("File trống hoặc không đúng định dạng!");return;}
          const mapped=rows.map((r,i)=>({
            stt:r["STT"]||r["stt"]||i+1,
            ma:String(r["Mã số"]||r["ma"]||r["MA"]||r["id"]||"").trim(),
            ten:String(r["Tên vật tư"]||r["ten"]||r["TEN"]||r["name"]||"").trim(),
            dv:String(r["ĐVT"]||r["dv"]||r["DV"]||"Cái").trim(),
            dm:Number(r["ĐM/1XE"]||r["ĐM"]||r["dm"]||r["DM"]||1),
            dmuc:String(r["Danh mục"]||r["dmuc"]||r["DMUC"]||"").trim(),
            vt:String(r["Vị trí"]||r["vt"]||r["VT"]||"").trim(),
            gc:String(r["Ghi chú"]||r["gc"]||r["GC"]||"").trim(),
          })).filter(r=>r.ma&&r.ten);
          if(!mapped.length){setXlsErr("Không tìm thấy cột Mã số / Tên vật tư!");return;}
          setXlsPreview(mapped);
        }catch(err){setXlsErr("Lỗi đọc file Excel: "+err.message);}
      };
      reader.readAsArrayBuffer(file);
    }
    e.target.value="";
  };

  const doXlsImport=(mode)=>{
    if(!xlsPreview.length)return;
    const rows=xlsPreview.map(v=>({id:uid(),pid,...v,anh:""}));
    setBomDB(s=>{
      const old=s[pid]||[];
      let next;
      if(mode==="thay") next={...s,[pid]:rows};
      else{
        const existMa=new Set(old.map(v=>v.ma));
        const news=rows.filter(v=>!existMa.has(v.ma));
        const maxStt=old.length?Math.max(...old.map(v=>v.stt)):0;
        next={...s,[pid]:[...old,...news.map((v,i)=>({...v,stt:maxStt+i+1}))]};
      }
      dbUpsertBom(pid,next[pid]);
      return next;
    });
    setShowXlsImport(false);
    setXlsPreview([]);
    flash(`✓ Import ${rows.length} mã từ Excel`);
  };

  const togSoan=(ma,slCN)=>setSoanDB(s=>{
    const c=(s[pid]||{})[ma];
    const nx=c?.on?{on:false,sl:slCN}:{on:true,sl:c?.sl??slCN};
    return{...s,[pid]:{...(s[pid]||{}),[ma]:nx}};
  });
  const setSlSoan=(ma,v)=>setSoanDB(s=>({...s,[pid]:{...(s[pid]||{}),[ma]:{...(s[pid]?.[ma]||{}),sl:v}}}));
  const rstSoan=()=>{if(!window.confirm("Reset checklist?"))return;setSoanDB(s=>({...s,[pid]:{}}));flash("✓ Reset");};
  const togGrp=(items,all)=>setSoanDB(s=>{
    const c=s[pid]||{};const p={};
    items.forEach(v=>{p[v.ma]={on:!all,sl:c[v.ma]?.sl??(v.dm*soXe)};});
    return{...s,[pid]:{...c,...p}};
  });

  // ── Gửi đơn ──
  const guiDon=()=>{
    const d=new Date();
    const sp=`DH-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${String((phList.length||0)+1).padStart(3,"0")}`;
    const phid=uid();
    const ct=bom.map((v,i)=>{
      const slCN=v.dm*soXe;
      const info=soan[v.ma];
      return{id:uid(),phid,stt:i+1,ma:v.ma,ten:v.ten,dv:v.dv,sl:info?.sl??slCN,ok:false};
    });
    const ph={id:phid,pid,sp,ngay:d.toISOString().slice(0,10),gc:`Đơn hàng ${proj.icon} ${proj.ten} — ${soXe} xe`,bg:"LINH KIỆN BUS",bn:"XƯỞNG HÀN",tt:"Chờ xác nhận",tong:ct.length,ts:d.toISOString(),ct};
    setPhDB(s=>({...s,[pid]:[ph,...(s[pid]||[])]}));
    dbSavePhieu(ph);
    const lsRows=ct.map(c=>({id:uid(),pid,ma:c.ma,ten:c.ten,loai:"Xuất kho",sl:-c.sl,gc:`Đơn ${sp}`,ts:new Date().toISOString()}));
    lsRows.forEach(r=>addLS(pid,r));
    supabase.from("lich_su").insert(lsRows).then(()=>{});
    setSoanDB(s=>({...s,[pid]:{}}));setTab("pgn");flash(`✓ Đã gửi đơn ${sp}`);
  };

  // ── Phiếu thủ công ──
  const spAuto=()=>{const d=new Date();return`PGN-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${String((phList.length||0)+1).padStart(3,"0")}`;};
  const openPh=()=>{setPhF({sp:spAuto(),ngay:new Date().toISOString().slice(0,10),gc:""});setPhIt([]);setAddIt({ma:"",sl:1});setShowPh(true);};
  const addPhIt=()=>{
    const vt=bom.find(v=>v.ma===addIt.ma);if(!vt)return;
    const sl=parseInt(addIt.sl)||1;
    setPhIt(ps=>{const ex=ps.find(p=>p.ma===vt.ma);if(ex)return ps.map(p=>p.ma===vt.ma?{...p,sl:p.sl+sl}:p);return[...ps,{ma:vt.ma,ten:vt.ten,dv:vt.dv,sl}];});
    setAddIt({ma:"",sl:1});
  };
  const submitPh=()=>{
    if(!phF.sp||phIt.length===0)return;
    const phid=uid();
    const ph={id:phid,pid,sp:phF.sp,ngay:phF.ngay,gc:phF.gc,bg:"LINH KIỆN BUS",bn:"XƯỞNG HÀN",tt:"Chờ xác nhận",tong:phIt.length,ts:new Date().toISOString(),
      ct:phIt.map((it,i)=>({id:uid(),phid,stt:i+1,ma:it.ma,ten:it.ten,dv:it.dv,sl:it.sl,ok:false}))};
    setPhDB(s=>({...s,[pid]:[ph,...(s[pid]||[])]}));
    dbSavePhieu(ph);
    const lsRows=phIt.map(it=>({id:uid(),pid,ma:it.ma,ten:it.ten,loai:"Xuất kho",sl:-it.sl,gc:`Phiếu ${phF.sp}`,ts:new Date().toISOString()}));
    lsRows.forEach(r=>addLS(pid,r));
    supabase.from("lich_su").insert(lsRows).then(()=>{});
    setShowPh(false);flash(`✓ Tạo phiếu ${phF.sp}`);
  };
  const xacNhan=id=>{
    setPhDB(s=>({...s,[pid]:(s[pid]||[]).map(p=>p.id===id?{...p,tt:"Đã xác nhận"}:p)}));
    dbUpdatePhieuTt(id,"Đã xác nhận");
  };
  const duyetCt=(phid,ctid)=>{
    setPhDB(s=>({...s,[pid]:(s[pid]||[]).map(p=>p.id===phid?{...p,ct:(p.ct||[]).map(c=>c.id===ctid?{...c,ok:true}:c)}:p)}));
    setViewPh(vp=>vp?({...vp,ct:(vp.ct||[]).map(c=>c.id===ctid?{...c,ok:true}:c)}):vp);
    dbUpdatePhieuCt(ctid,true);
  };
  const duyetAll=phid=>{
    if(!window.confirm("Duyệt tất cả?"))return;
    setPhDB(s=>{
      const next={...s,[pid]:(s[pid]||[]).map(p=>p.id===phid?{...p,tt:"Đã xác nhận",ct:(p.ct||[]).map(c=>({...c,ok:true}))}:p)};
      const ph=next[pid]?.find(p=>p.id===phid);
      if(ph){
        dbUpdatePhieuTt(phid,"Đã xác nhận");
        (ph.ct||[]).forEach(c=>dbUpdatePhieuCt(c.id,true));
      }
      return next;
    });
    setViewPh(vp=>vp?({...vp,tt:"Đã xác nhận",ct:(vp.ct||[]).map(c=>({...c,ok:true}))}):vp);
    flash("✓ Đã duyệt toàn bộ");
  };

  const hdAnh=e=>{
    const f=e.target.files[0];if(!f)return;
    if(f.size>5*1024*1024){alert("Max 5MB");return;}
    const r=new FileReader();r.onload=ev=>setCur(c=>({...c,anh:ev.target.result}));r.readAsDataURL(f);e.target.value="";
  };

  // ── Sort/filter ──
  const sortBy=col=>{if(sCol===col)setSAsc(a=>!a);else{setSCol(col);setSAsc(true);}};
  const Arr=({col})=><span style={{opacity:sCol===col?1:.2,marginLeft:2,fontSize:9}}>{sCol===col&&!sAsc?"▼":"▲"}</span>;
  const filtered=useMemo(()=>{
    let d=fdm!=="Tất cả"?bom.filter(v=>v.dmuc===fdm):bom;
    if(search){const q=search.toLowerCase();d=d.filter(v=>String(v.stt).includes(q)||v.ma.toLowerCase().includes(q)||v.ten.toLowerCase().includes(q)||(v.vt||"").toLowerCase().includes(q));}
    const km={stt:"stt",ma:"ma",ten:"ten",dmuc:"dmuc",vt:"vt",dv:"dv",dm:"dm",gc:"gc"};
    return[...d].sort((a,b)=>{const k=km[sCol]||sCol;let va=a[k],vb=b[k];if(typeof va==="string"){va=va.toLowerCase();vb=vb.toLowerCase();}return sAsc?(va<vb?-1:va>vb?1:0):(va>vb?-1:va<vb?1:0);});
  },[bom,search,fdm,sCol,sAsc]);

  const statDM=useMemo(()=>{
    const m={};bom.forEach(v=>{if(!m[v.dmuc])m[v.dmuc]={n:0,t:0};m[v.dmuc].n++;m[v.dmuc].t+=v.dm;});
    return Object.entries(m).sort((a,b)=>b[1].t-a[1].t);
  },[bom]);

  // ── Tích lũy ──
  const {dnMap,phByMa}=useMemo(()=>{
    const dnMap={},phByMa={};
    for(const ph of [...phList].reverse()){
      for(const c of(ph.ct||[])){
        dnMap[c.ma]=(dnMap[c.ma]||0)+(c.sl||0);
        if(!phByMa[c.ma])phByMa[c.ma]=[];
        phByMa[c.ma].push({sp:ph.sp,ngay:ph.ngay,sl:c.sl});
      }
    }
    return{dnMap,phByMa};
  },[phList]);

  const th=useMemo(()=>bom.map(v=>{
    const cn=v.dm*soXe,dn=dnMap[v.ma]||0;
    const ct=Math.max(0,cn-dn),vt=Math.max(0,dn-cn);
    const p=cn>0?Math.min(100,Math.round(dn/cn*100)):0;
    return{...v,cn,dn,ct,vt,p,done:dn>=cn,phs:phByMa[v.ma]||[]};
  }),[bom,dnMap,phByMa,soXe]);

  const maDone=th.filter(v=>v.done).length;
  const totCN=th.reduce((s,v)=>s+v.cn,0);
  const totDN=th.reduce((s,v)=>s+v.dn,0);
  const totCT=th.reduce((s,v)=>s+v.ct,0);
  const totVT=th.reduce((s,v)=>s+v.vt,0);
  const pctT=totCN>0?Math.min(100,Math.round(totDN/totCN*100)):0;
  const duAll=maDone===bom.length&&bom.length>0;

  const nhomDM=useMemo(()=>{const m={};th.forEach(v=>{if(!m[v.dmuc])m[v.dmuc]=[];m[v.dmuc].push(v);});return m;},[th]);
  const freshVP=viewPh?(phList.find(p=>p.id===viewPh.id)||viewPh):null;
  const mauP=proj.mau||"#1d4ed8";

  const Tag=({bg="#eff6ff",c="#1d4ed8",ch})=><span style={{background:bg,color:c,padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:700}}>{ch}</span>;


  // ── RENDER ──
  if(!user) return <LoginScreen onLogin={(u,us)=>{setUser(u);if(us)setUsers(us);
    // Set default tab per role
    setTab(u.role==="thck"?"soan":"ds");
  }}/>;

  const role      = user.role;           // "thck" | "xuonghan"
  const isTHCK    = role==="thck";
  const isXH      = role==="xuonghan";
  const TABS_NOW  = isTHCK ? TABS_THCK : TABS_XUONGHAN;
  const mauRole   = isTHCK ? "#1d4ed8" : "#b45309";

  return(
    <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",background:"#f0f4f8",minHeight:"100vh"}}>

      {/* HEADER */}
      <div style={{background:isTHCK?"linear-gradient(135deg,#1e3a5f,#1d4ed8)":"linear-gradient(135deg,#431407,#b45309)",color:"#fff",padding:"12px 18px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:28}}>{isTHCK?"🏭":"🔧"}</div>
            <div>
              <div style={{fontSize:15,fontWeight:700}}>{isTHCK?"Nhà máy THCK":"Xưởng Hàn"} — Quản Lý Vật Tư BOM</div>
              <div style={{fontSize:10,opacity:.65,marginTop:1}}>
                {isTHCK?"Soạn hàng · Lập phiếu giao vật tư → Xưởng Hàn":"Kiểm tra phiếu · Xác nhận · Quản lý · Báo cáo"}
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <div style={{fontSize:11,color:msg?"#6ee7b7":"rgba(255,255,255,0.3)",minWidth:80,textAlign:"right"}}>{msg}</div>
            {/* User badge */}
            <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.12)",borderRadius:20,padding:"5px 12px"}}>
              <span style={{fontSize:18}}>{user.avatar}</span>
              <div>
                <div style={{fontSize:12,fontWeight:700}}>{user.ten}</div>
                <div style={{fontSize:10,opacity:.7}}>{user.don_vi}</div>
              </div>
            </div>
            <button onClick={()=>{if(window.confirm("Đăng xuất?"))setUser(null);}}
              style={{...btn,background:"rgba(255,255,255,0.15)",color:"#fff",border:"1px solid rgba(255,255,255,0.3)",padding:"6px 12px",fontSize:12}}>
              🚪 Đăng xuất
            </button>
          </div>
        </div>
        {/* Project selector — THCK thấy đủ; XH chỉ xem */}
        <div style={{marginTop:10,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <span style={{fontSize:11,opacity:.7}}>Dự án:</span>
          <select value={pid} onChange={e=>sw(e.target.value)}
            style={{padding:"5px 10px",borderRadius:7,border:"1px solid rgba(255,255,255,0.3)",background:"rgba(255,255,255,0.15)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",outline:"none"}}>
            {projs.map(p=><option key={p.id} value={p.id} style={{background:"#1e3a5f"}}>{p.icon} {p.ten}</option>)}
          </select>
          <button onClick={()=>setNewP(true)} style={{...btn,background:"rgba(255,255,255,0.2)",color:"#fff",border:"1px solid rgba(255,255,255,0.3)"}}>+ Thêm dự án</button>
          {projs.length>1&&<button onClick={()=>delProj(pid)} style={{...btn,background:"rgba(220,38,38,0.35)",color:"#fca5a5",fontSize:11}}>🗑 Xóa</button>}
          <span onClick={isXH?editSoXe:editSoXe} style={{background:"rgba(255,255,255,0.2)",borderRadius:6,padding:"3px 10px",fontSize:12,fontWeight:700,color:"#fbbf24",cursor:"pointer",marginLeft:"auto"}}>🚌 {soXe} xe</span>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {[[fmt(bom.length),"Mã VT","#fff"],[fmt(phList.length),"Phiếu","#fbbf24"],[fmt(ls.length),"GD","#6ee7b7"]].map(([v,l,c])=>(
              <div key={l} style={{textAlign:"center",background:"rgba(255,255,255,0.12)",padding:"3px 10px",borderRadius:7}}>
                <div style={{fontWeight:700,fontSize:13,color:c}}>{v}</div>
                <div style={{opacity:.65,fontSize:9}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Role badge */}
        <div style={{marginTop:8,display:"flex",gap:8,alignItems:"center"}}>
          <span style={{background:isTHCK?"rgba(29,78,216,0.4)":"rgba(180,83,9,0.4)",border:`1px solid ${isTHCK?"rgba(147,197,253,0.5)":"rgba(253,186,116,0.5)"}`,borderRadius:20,padding:"2px 12px",fontSize:11,fontWeight:700,color:isTHCK?"#bfdbfe":"#fed7aa"}}>
            {isTHCK?"🏭 NHÂN VIÊN NHÀ MÁY THCK":"🔧 NHÂN VIÊN XƯỞNG HÀN"}
          </span>
          {isTHCK&&<span style={{fontSize:11,opacity:.6}}>Quyền: Soạn hàng · Lập phiếu giao vật tư</span>}
          {isXH&&<span style={{fontSize:11,opacity:.6}}>Quyền: Kiểm tra · Xác nhận · Quản lý BOM · Báo cáo</span>}
        </div>
      </div>

      {/* TABS */}
      <div style={{background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"0 18px",display:"flex",gap:2,overflowX:"auto"}}>
        {TABS_NOW.map(([k,l])=>{
          const active=tab===k;
          const c=k==="soan"?mauRole:k==="bc"?"#7c3aed":k==="users"?"#6b7280":mauRole;
          return(
            <button key={k} onClick={()=>setTab(k)} style={{...btn,background:"none",borderRadius:0,fontWeight:active?700:400,
              color:active?c:"#6b7280",borderBottom:active?`2px solid ${c}`:"2px solid transparent",
              padding:"10px 13px",fontSize:13,whiteSpace:"nowrap"}}>
              {k==="soan"&&soaned>0?l.replace("Soạn Hàng",`Soạn Hàng (${soaned}/${bom.length})`):l}
            </button>
          );
        })}
      </div>

      <div style={{padding:"14px 18px"}}>

        {/* ── DANH SÁCH BOM ── */}
        {tab==="ds"&&(
          <div>
            <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
              <input placeholder="🔍 STT, mã, tên, vị trí..." value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,width:260,flex:"0 0 auto"}}/>
              <select value={fdm} onChange={e=>setFdm(e.target.value)} style={{...inp,width:200,flex:"0 0 auto"}}>
                <option>Tất cả</option>{DMS.map(d=><option key={d}>{d}</option>)}
              </select>
              <div style={{marginLeft:"auto",display:"flex",gap:8,flexWrap:"wrap"}}>
                <button onClick={()=>setShowXlsImport(true)} style={{...btn,background:"#f0fdf4",color:"#065f46",padding:"7px 14px",fontSize:13,border:"1px solid #bbf7d0"}}>📊 Import Excel</button>
                <button onClick={()=>setShowImport(true)} style={{...btn,background:"#f3f4f6",color:"#374151",padding:"7px 14px",fontSize:13,border:"1px solid #e5e7eb"}}>📥 Import BOM</button>
                {isXH&&<button onClick={()=>{setCur({...E0,dmuc:DMS[0]||""});setModal("add");}} style={{...btn,background:mauP,color:"#fff",padding:"7px 16px",fontSize:13}}>+ Thêm mới</button>}
              </div>
            </div>
            <div style={{background:"#fff",borderRadius:10,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead>
                    <tr style={{background:"#f8fafc",borderBottom:"2px solid #e5e7eb"}}>
                      {[["stt","STT"],["ma","Mã số"],["ten","Tên vật tư"],["dmuc","Danh mục"],["vt","Vị trí"],["dv","ĐVT"],["dm","ĐM/1XE"]].map(([col,lb])=>(
                        <th key={col} onClick={()=>sortBy(col)} style={{padding:"8px 10px",textAlign:col==="dm"?"center":"left",fontWeight:700,color:"#374151",cursor:"pointer",whiteSpace:"nowrap",userSelect:"none"}}>
                          {lb}<Arr col={col}/>
                        </th>
                      ))}
                      <th style={{padding:"8px 10px",textAlign:"center",fontWeight:700,color:"#065f46",background:"#f0fdf4",whiteSpace:"nowrap"}}>Cần nhận<br/>(×{soXe}xe)</th>
                      <th style={{padding:"8px 10px",fontWeight:700,color:"#374151"}}>Ghi chú</th>
                      <th style={{padding:"8px 10px",fontWeight:700,color:"#374151",textAlign:"center"}}>Ảnh</th>
                      <th style={{padding:"8px 10px",fontWeight:700,color:"#374151",textAlign:"center"}}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length===0&&<tr><td colSpan={11} style={{textAlign:"center",padding:40,color:"#9ca3af"}}>Không tìm thấy vật tư nào</td></tr>}
                    {filtered.map((v,i)=>(
                      <tr key={v.ma+i} style={{borderBottom:"1px solid #f1f5f9",background:i%2===0?"#fff":"#f9fafb"}}>
                        <td style={{padding:"7px 10px",textAlign:"center",color:"#6b7280",fontWeight:600}}>{v.stt}</td>
                        <td style={{padding:"7px 10px",fontWeight:700,color:mauP,fontFamily:"monospace",fontSize:11,whiteSpace:"nowrap"}}>{v.ma}</td>
                        <td style={{padding:"7px 10px",maxWidth:220,fontSize:12}}>{v.ten}</td>
                        <td style={{padding:"7px 10px",whiteSpace:"nowrap"}}><Tag ch={v.dmuc}/></td>
                        <td style={{padding:"7px 10px",fontFamily:"monospace",color:"#6b7280",fontSize:11}}>{v.vt}</td>
                        <td style={{padding:"7px 10px",color:"#6b7280",textAlign:"center"}}>{v.dv}</td>
                        <td style={{padding:"7px 10px",fontWeight:700,color:"#16a34a",textAlign:"center"}}>{fmt(v.dm)}</td>
                        <td style={{padding:"7px 10px",fontWeight:700,color:"#065f46",textAlign:"center",background:"#f0fdf4"}}>{fmt(v.dm*soXe)}</td>
                        <td style={{padding:"7px 10px",color:"#6b7280",fontSize:11,maxWidth:160}}>{v.gc||"—"}</td>
                        <td style={{padding:"7px 10px",textAlign:"center"}}>
                          {v.anh?<img src={v.anh} alt="" onClick={()=>setAnhPv(v.anh)} style={{width:34,height:34,objectFit:"cover",borderRadius:5,cursor:"zoom-in",border:"1px solid #e5e7eb"}}/>
                            :<span style={{color:"#d1d5db",fontSize:16}}>🖼</span>}
                        </td>
                        <td style={{padding:"7px 10px",textAlign:"center",whiteSpace:"nowrap"}}>
                          <button onClick={()=>{setCur({...E0,...v});setSlXT(1);setGcXT("");setModal("nhap");}} style={{...btn,background:"#d1fae5",color:"#065f46",marginRight:2}}>Nhập</button>
                          <button onClick={()=>{setCur({...E0,...v});setSlXT(1);setGcXT("");setModal("xuat");}} style={{...btn,background:"#fee2e2",color:"#991b1b",marginRight:2}}>Xuất</button>
                          <button onClick={()=>{setCur({...E0,...v});setModal("edit");}} style={{...btn,background:"#fef3c7",color:"#92400e",marginRight:2}}>Sửa</button>
                          <button onClick={()=>del(v)} style={{...btn,background:"#fee2e2",color:"#991b1b"}}>Xóa</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{padding:"7px 14px",borderTop:"1px solid #f1f5f9",fontSize:11,color:"#9ca3af",display:"flex",justifyContent:"space-between"}}>
                <span>{filtered.length}/{bom.length} mã</span>
                <span style={{display:"flex",gap:16}}>
                  <span>ĐM tổng: <b>{fmt(filtered.reduce((s,v)=>s+v.dm,0))}</b></span>
                  <span style={{color:"#065f46"}}>Cần nhận ({soXe} xe): <b>{fmt(filtered.reduce((s,v)=>s+v.dm*soXe,0))}</b></span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── SOẠN HÀNG ── */}
        {/* ── SOẠN HÀNG ── */}
        {tab==="soan"&&(()=>{
          const daSoan=bom.filter(v=>soan[v.ma]?.on);
          const chuaSoan=bom.filter(v=>!soan[v.ma]?.on);
          const pct=bom.length?Math.round(daSoan.length/bom.length*100):0;
          const xong=pct===100&&bom.length>0;
          const nhom={};bom.forEach(v=>{if(!nhom[v.dmuc])nhom[v.dmuc]=[];nhom[v.dmuc].push(v);});
          return(
            <div>
              <div style={{background:"#fff",borderRadius:12,padding:"16px 20px",marginBottom:14,boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                      <span style={{fontWeight:700,fontSize:15}}>📋 Soạn Hàng — {proj.icon} {proj.ten}</span>
                      <span style={{background:"#fef3c7",color:"#92400e",borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700}}>🚌 {soXe} xe</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <Prog p={pct} done={xong} h={10}/>
                      <span style={{fontWeight:700,fontSize:13,color:xong?"#16a34a":"#92400e",minWidth:60}}>{daSoan.length}/{bom.length} ({pct}%)</span>
                    </div>
                    <div style={{fontSize:11,color:"#6b7280",marginTop:4}}>✅ Đã soạn: <b style={{color:"#16a34a"}}>{daSoan.length}</b> · ⏳ Chưa: <b style={{color:"#dc2626"}}>{chuaSoan.length}</b></div>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={rstSoan} style={{...btn,background:"#fee2e2",color:"#991b1b",padding:"7px 14px"}}>🔄 Reset</button>
                    <button onClick={()=>{if(!window.confirm(`Gửi ${bom.length} mã đến Xưởng Hàn?`))return;guiDon();}} disabled={bom.length===0}
                      style={{...btn,background:xong?"#16a34a":"#f59e0b",color:"#fff",padding:"7px 18px",fontSize:13,fontWeight:700,opacity:bom.length===0?.5:1}}>
                      {xong?"✅ Gửi Xưởng Hàn":`📤 Gửi đơn (${daSoan.length}/${bom.length})`}
                    </button>
                  </div>
                </div>
              </div>
              {Object.entries(nhom).map(([dm,items])=>{
                const dG=items.filter(v=>soan[v.ma]?.on).length;
                const aD=dG===items.length;
                const aC=items.every(v=>soan[v.ma]?.on);
                return(
                  <div key={dm} style={{background:"#fff",borderRadius:10,marginBottom:10,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.07)",border:`1px solid ${aD?"#bbf7d0":"#e5e7eb"}`}}>
                    <div style={{padding:"10px 16px",background:aD?"#f0fdf4":"#f8fafc",borderBottom:"1px solid #e5e7eb",display:"flex",alignItems:"center",gap:10}}>
                      <Tag bg={aD?"#16a34a":"#1d4ed8"} c="#fff" ch={dm}/>
                      <span style={{fontSize:12,color:"#6b7280"}}>{dG}/{items.length}</span>
                      {aD&&<span>✅</span>}
                      <button onClick={()=>togGrp(items,aC)} style={{...btn,marginLeft:"auto",background:"#eff6ff",color:"#1d4ed8",padding:"4px 12px",fontSize:11}}>
                        {aC?"Bỏ chọn":"Chọn cả nhóm"}
                      </button>
                    </div>
                    {items.map((v,i)=>{
                      const on=soan[v.ma]?.on||false;
                      const slCN=v.dm*soXe;
                      const slV=soan[v.ma]?.sl??slCN;
                      return(
                        <div key={v.ma} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",borderBottom:i<items.length-1?"1px solid #f1f5f9":"none",background:on?"#f0fdf4":"transparent"}}>
                          <div onClick={()=>togSoan(v.ma,slCN)} style={{width:22,height:22,borderRadius:6,border:`2px solid ${on?"#16a34a":"#d1d5db"}`,background:on?"#16a34a":"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
                            {on&&<span style={{color:"#fff",fontSize:13,fontWeight:700}}>✓</span>}
                          </div>
                          {v.anh?<img src={v.anh} alt="" onClick={()=>setAnhPv(v.anh)} style={{width:36,height:36,objectFit:"cover",borderRadius:6,border:"1px solid #e5e7eb",cursor:"zoom-in",flexShrink:0}}/>
                            :<div style={{width:36,height:36,borderRadius:6,background:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",color:"#d1d5db",flexShrink:0}}>🖼</div>}
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontWeight:on?400:700,color:on?"#9ca3af":"#1f2937",textDecoration:on?"line-through":"none"}}>{v.ten}</div>
                            <div style={{fontSize:11,color:"#6b7280",marginTop:2,display:"flex",gap:10,flexWrap:"wrap"}}>
                              <span style={{fontFamily:"monospace",fontWeight:700,color:mauP}}>{v.ma}</span>
                              <span>Vị trí: <b>{v.vt||"—"}</b></span>
                              <span style={{color:"#065f46",fontWeight:700}}>Cần: {fmt(slCN)} {v.dv}</span>
                            </div>
                          </div>
                          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,flexShrink:0}}>
                            <label style={{fontSize:9,color:"#9ca3af",fontWeight:700}}>SL THỰC</label>
                            <input type="number" min={0} value={slV} onChange={e=>setSlSoan(v.ma,parseInt(e.target.value)||0)} onClick={e=>e.stopPropagation()}
                              style={{width:64,textAlign:"center",padding:"4px 6px",border:`1px solid ${slV!==slCN?"#f59e0b":"#d1d5db"}`,borderRadius:6,fontSize:13,fontWeight:700,color:slV!==slCN?"#92400e":"#065f46",outline:"none",background:slV!==slCN?"#fffbeb":"#f0fdf4"}}/>
                            {slV!==slCN&&<span style={{fontSize:9,color:"#f59e0b"}}>≠ kế hoạch</span>}
                          </div>
                          <div style={{width:24,height:24,borderRadius:"50%",background:on?"#d1fae5":"#f1f5f9",color:on?"#065f46":"#9ca3af",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0}}>{v.stt}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              {bom.length===0&&<div style={{background:"#fff",borderRadius:10,padding:60,textAlign:"center",color:"#9ca3af",boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
                <div style={{fontSize:48,marginBottom:12}}>📦</div><div style={{fontSize:14,fontWeight:600}}>Dự án chưa có vật tư</div>
              </div>}
              {bom.length>0&&(
                <div style={{position:"sticky",bottom:12,margin:"14px 0 0",background:xong?"linear-gradient(135deg,#16a34a,#15803d)":"linear-gradient(135deg,#1e3a5f,#1d4ed8)",borderRadius:12,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,boxShadow:"0 4px 20px rgba(0,0,0,0.2)",flexWrap:"wrap"}}>
                  <div>
                    <div style={{color:"#fff",fontWeight:700,fontSize:14}}>{xong?"✅ Đã soạn xong!":` ${daSoan.length}/${bom.length} mã đã soạn`}</div>
                    <div style={{color:"rgba(255,255,255,0.7)",fontSize:11,marginTop:2}}>{xong?"Nhấn Gửi Xưởng Hàn để hoàn tất":`Còn ${chuaSoan.length} mã chưa soạn`}</div>
                  </div>
                  <button onClick={()=>{if(!window.confirm(`Gửi đơn ${bom.length} mã?`))return;guiDon();}}
                    style={{...btn,background:"#fff",color:xong?"#16a34a":"#1d4ed8",padding:"10px 24px",fontSize:14,fontWeight:700,borderRadius:10}}>
                    📤 {xong?"Gửi Xưởng Hàn":"Gửi đơn ngay"}
                  </button>
                </div>
              )}
            </div>
          );
        })()}


        {/* ── PHIẾU GN ── */}
        {tab==="pgn"&&(()=>{
          const DMP=["Tất cả",...new Set(bom.map(v=>v.dmuc).filter(Boolean))];
          const f2=th.filter(v=>{
            if(pgnDm!=="Tất cả"&&v.dmuc!==pgnDm)return false;
            if(pgnSO==="thieu"&&v.done)return false;
            if(pgnSO==="du"&&!v.done)return false;
            if(pgnSr){const q=pgnSr.toLowerCase();if(!v.ma.toLowerCase().includes(q)&&!v.ten.toLowerCase().includes(q))return false;}
            return true;
          });
          return(
            <div>
              <div style={{background:duAll?"linear-gradient(135deg,#16a34a,#15803d)":"linear-gradient(135deg,#1e3a5f,#1d4ed8)",borderRadius:12,padding:"18px 22px",marginBottom:14,color:"#fff",boxShadow:"0 4px 16px rgba(0,0,0,0.15)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:12}}>
                  <div>
                    <div style={{fontSize:16,fontWeight:700}}>{duAll?"✅ Đã nhận đủ vật tư!":"📊 Tiến độ Nhận Vật Tư Tích Lũy"}</div>
                    <div style={{fontSize:12,opacity:.8,marginTop:3}}>{proj.icon} {proj.ten} · 🚌 {soXe} xe · {phList.length} phiếu</div>
                  </div>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                    {[["Đủ ✅",maDone,"#6ee7b7"],["Thiếu ⚠️",bom.length-maDone,"#fca5a5"],["Tổng",bom.length,"#fff"]].map(([l,v,c])=>(
                      <div key={l} style={{textAlign:"center",background:"rgba(255,255,255,0.15)",borderRadius:8,padding:"6px 14px"}}>
                        <div style={{fontWeight:700,fontSize:18,color:c}}>{v}</div>
                        <div style={{fontSize:10,opacity:.8}}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <Prog p={pctT} done={duAll} h={12}/>
                  <span style={{fontWeight:700,fontSize:14,minWidth:50,textAlign:"right"}}>{pctT}%</span>
                </div>
                <div style={{display:"flex",gap:20,marginTop:8,fontSize:12,opacity:.85,flexWrap:"wrap"}}>
                  <span>Cần: <b>{fmt(totCN)}</b></span>
                  <span>Đã nhận: <b style={{color:"#6ee7b7"}}>{fmt(totDN)}</b></span>
                  <span>Còn thiếu: <b style={{color:"#fca5a5"}}>{fmt(totCT)}</b></span>
                </div>
              </div>
              <div style={{background:"#fff",borderRadius:10,padding:"12px 16px",marginBottom:12,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                <input placeholder="🔍 Mã, tên..." value={pgnSr} onChange={e=>setPgnSr(e.target.value)} style={{...inp,width:180,flex:"0 0 auto"}}/>
                <select value={pgnDm} onChange={e=>setPgnDm(e.target.value)} style={{...inp,width:180,flex:"0 0 auto"}}>
                  {DMP.map(d=><option key={d}>{d}</option>)}
                </select>
                <div style={{display:"flex",gap:4}}>
                  {[["all","Tất cả","#6b7280"],["thieu",`⚠️ Còn thiếu (${bom.length-maDone})`,"#dc2626"],["du",`✅ Đủ (${maDone})`,"#16a34a"]].map(([v,l,c])=>(
                    <button key={v} onClick={()=>setPgnSO(v)} style={{...btn,background:pgnSO===v?c:"#f3f4f6",color:pgnSO===v?"#fff":"#374151",padding:"5px 12px",fontSize:11}}>{l}</button>
                  ))}
                </div>
                {isTHCK&&<button onClick={openPh} style={{...btn,background:mauP,color:"#fff",padding:"7px 14px",fontSize:12,marginLeft:"auto"}}>+ Tạo phiếu</button>}
              </div>
              <div style={{background:"#fff",borderRadius:10,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.08)",marginBottom:16}}>
                <div style={{padding:"10px 16px",borderBottom:"1px solid #e5e7eb",fontWeight:700,fontSize:13,display:"flex",justifyContent:"space-between"}}>
                  <span>📊 Bảng Tích Lũy ({f2.length} mã)</span>
                  <span style={{fontSize:11,color:"#6b7280",fontWeight:400}}>Cộng dồn {phList.length} phiếu</span>
                </div>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                    <thead>
                      <tr style={{background:"#f8fafc",borderBottom:"2px solid #e5e7eb"}}>
                        {["STT","Mã số","Tên vật tư","ĐVT","ĐM",`Cần(×${soXe})`,"Đã nhận","Còn thiếu","Tiến độ"].map((h,i)=>(
                          <th key={i} style={{padding:"8px 10px",textAlign:i>=4?"center":"left",fontWeight:700,color:h==="Đã nhận"?"#065f46":h==="Còn thiếu"?"#dc2626":"#374151",whiteSpace:"nowrap",fontSize:11}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {f2.length===0&&<tr><td colSpan={9} style={{textAlign:"center",padding:40,color:"#9ca3af"}}>Không có dữ liệu</td></tr>}
                      {f2.map((v,i)=>(
                        <tr key={v.ma} style={{borderBottom:"1px solid #f1f5f9",background:v.done?"#f0fdf4":i%2===0?"#fff":"#f9fafb"}}>
                          <td style={{padding:"7px 10px",textAlign:"center",color:"#9ca3af",fontSize:11}}>{v.stt}</td>
                          <td style={{padding:"7px 10px",fontWeight:700,color:mauP,fontFamily:"monospace",fontSize:10,whiteSpace:"nowrap"}}>{v.ma}</td>
                          <td style={{padding:"7px 10px",maxWidth:200,fontSize:12}}><span title={v.ten}>{v.ten.length>40?v.ten.slice(0,40)+"…":v.ten}</span></td>
                          <td style={{padding:"7px 10px",color:"#6b7280",textAlign:"center"}}>{v.dv}</td>
                          <td style={{padding:"7px 10px",textAlign:"center",color:"#6b7280"}}>{fmt(v.dm)}</td>
                          <td style={{padding:"7px 10px",textAlign:"center",fontWeight:700}}>{fmt(v.cn)}</td>
                          <td style={{padding:"7px 10px",textAlign:"center",fontWeight:700,color:v.dn>0?"#065f46":"#9ca3af"}}>
                            {fmt(v.dn)}{v.vt>0&&<span style={{fontSize:9,color:"#b45309",display:"block"}}>+{fmt(v.vt)} vượt</span>}
                          </td>
                          <td style={{padding:"7px 10px",textAlign:"center",fontWeight:700,color:v.done?"#16a34a":"#dc2626"}}>{v.done?"✅":fmt(v.ct)}</td>
                          <td style={{padding:"7px 10px",minWidth:100}}>
                            <div style={{display:"flex",alignItems:"center",gap:6}}>
                              <Prog p={v.p} done={v.done}/>
                              <span style={{fontSize:10,fontWeight:700,minWidth:32,color:v.done?"#16a34a":"#6b7280"}}>{v.p}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{background:"#f8fafc",borderTop:"2px solid #e5e7eb"}}>
                        <td colSpan={4} style={{padding:"9px 10px",fontWeight:700}}>Tổng ({f2.length} mã)</td>
                        <td/><td style={{padding:"9px 10px",textAlign:"center",fontWeight:700}}>{fmt(f2.reduce((s,v)=>s+v.cn,0))}</td>
                        <td style={{padding:"9px 10px",textAlign:"center",fontWeight:700,color:"#065f46"}}>{fmt(f2.reduce((s,v)=>s+v.dn,0))}</td>
                        <td style={{padding:"9px 10px",textAlign:"center",fontWeight:700,color:"#dc2626"}}>{fmt(f2.reduce((s,v)=>s+v.ct,0))}</td>
                        <td/>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              <div style={{fontWeight:700,fontSize:13,color:"#374151",marginBottom:10}}>📄 Phiếu đã gửi ({phList.length})</div>
              {phList.length===0?(
                <div style={{background:"#fff",borderRadius:10,padding:40,textAlign:"center",color:"#9ca3af",boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
                  <div style={{fontSize:36,marginBottom:8}}>📋</div><div>Chưa có phiếu nào</div>
                </div>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {phList.map(ph=>(
                    <div key={ph.id} style={{background:"#fff",borderRadius:10,padding:"12px 16px",boxShadow:"0 1px 4px rgba(0,0,0,0.07)",border:`1px solid ${ph.tt==="Đã xác nhận"?"#bbf7d0":"#e5e7eb"}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                          <span style={{fontWeight:700,fontSize:14}}>📄 {ph.sp}</span>
                          <Tag bg={ph.tt==="Đã xác nhận"?"#d1fae5":"#fef3c7"} c={ph.tt==="Đã xác nhận"?"#065f46":"#92400e"} ch={ph.tt}/>
                          <span style={{fontSize:11,color:"#9ca3af"}}>📅 {ph.ngay}</span>
                          <span style={{fontSize:11,color:"#6b7280"}}>📦 {ph.tong} mã</span>
                        </div>
                        <div style={{display:"flex",gap:6}}>
                          <button onClick={()=>setViewPh(ph)} style={{...btn,background:"#eff6ff",color:"#1d4ed8",padding:"4px 11px",fontSize:11}}>Xem</button>
                          {isXH&&ph.tt!=="Đã xác nhận"&&<button onClick={()=>xacNhan(ph.id)} style={{...btn,background:"#d1fae5",color:"#065f46",padding:"4px 11px",fontSize:11}}>✓ Xác nhận</button>}
                        </div>
                      </div>
                      {ph.gc&&<div style={{fontSize:11,color:"#6b7280",marginTop:4}}>💬 {ph.gc}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* ── BÁO CÁO ── */}
        {tab==="bc"&&(()=>{
          const togDm=dm=>setBcDmO(s=>({...s,[dm]:!s[dm]}));
          const togExp=ma=>setBcExp(s=>({...s,[ma]:!s[ma]}));
          return(
            <div>
              <div style={{background:duAll?"linear-gradient(135deg,#16a34a,#15803d)":"linear-gradient(135deg,#312e81,#4f46e5)",borderRadius:12,padding:"20px 22px",marginBottom:14,color:"#fff",boxShadow:"0 4px 20px rgba(0,0,0,0.18)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:14}}>
                  <div>
                    <div style={{fontSize:17,fontWeight:700}}>{duAll?"✅ Đã nhận đủ vật tư toàn bộ!":"📈 Báo Cáo Tổng Hợp Nhận Vật Tư"}</div>
                    <div style={{fontSize:12,opacity:.8,marginTop:3}}>{proj.icon} {proj.ten} · 🚌 {soXe} xe · {phList.length} phiếu</div>
                  </div>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                    {[["Tổng mã",bom.length,"#c7d2fe"],["Đủ ✅",maDone,"#6ee7b7"],["Thiếu ⚠️",bom.length-maDone,"#fca5a5"],["Phiếu",phList.length,"#fde68a"]].map(([l,v,c])=>(
                      <div key={l} style={{textAlign:"center",background:"rgba(255,255,255,0.12)",borderRadius:10,padding:"8px 16px",minWidth:70}}>
                        <div style={{fontWeight:700,fontSize:22,color:c}}>{v}</div>
                        <div style={{fontSize:10,opacity:.8,marginTop:1}}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,opacity:.8,marginBottom:4}}>
                    <span>Tiến độ nhận vật tư tích lũy</span>
                    <span style={{fontWeight:700,fontSize:13}}>{pctT}%</span>
                  </div>
                  <Prog p={pctT} done={duAll} h={14}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginTop:12}}>
                  {[["Tổng cần",fmt(totCN),"#c7d2fe",`${soXe} xe × ĐM`],["Đã nhận",fmt(totDN),"#6ee7b7",`${pctT}%`],["Còn thiếu",fmt(totCT),"#fca5a5",`${bom.length-maDone} mã`],["Vượt KH",fmt(totVT),"#fde68a",totVT>0?"Kiểm tra":"Không có"]].map(([l,v,c,s])=>(
                    <div key={l} style={{background:"rgba(255,255,255,0.1)",borderRadius:8,padding:"10px 12px"}}>
                      <div style={{fontWeight:700,fontSize:16,color:c}}>{v}</div>
                      <div style={{fontSize:10,opacity:.75,marginTop:2}}>{l}</div>
                      <div style={{fontSize:10,opacity:.55,marginTop:1}}>{s}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{background:"#fff",borderRadius:10,padding:"14px 18px",marginBottom:14,boxShadow:"0 1px 4px rgba(0,0,0,0.07)"}}>
                <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>📊 Tiến độ theo Danh mục</div>
                {Object.entries(nhomDM).map(([dm,items])=>{
                  const dC=items.reduce((s,v)=>s+v.cn,0),dD=items.reduce((s,v)=>s+v.dn,0);
                  const dP=dC>0?Math.min(100,Math.round(dD/dC*100)):0,dDn=items.every(v=>v.done);
                  return(
                    <div key={dm} style={{marginBottom:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:3}}>
                        <span style={{fontSize:11,fontWeight:700,minWidth:200}}>{dm}</span>
                        <Prog p={dP} done={dDn}/>
                        <span style={{fontSize:11,fontWeight:700,minWidth:42,textAlign:"right",color:dDn?"#16a34a":"#374151"}}>{dP}%</span>
                        <span style={{fontSize:10,color:"#6b7280",minWidth:90,textAlign:"right"}}>{fmt(dD)}/{fmt(dC)}</span>
                        <span style={{fontSize:11,minWidth:18}}>{dDn?"✅":"⏳"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
                <span style={{fontSize:13,fontWeight:700,color:"#374151"}}>📋 Chi tiết từng mã</span>
                <div style={{display:"flex",gap:4,marginLeft:"auto"}}>
                  {[["all","Tất cả"],["thieu",`⚠️ Còn thiếu (${bom.length-maDone})`],["du",`✅ Đủ (${maDone})`]].map(([v,l])=>(
                    <button key={v} onClick={()=>setBcFlt(v)} style={{...btn,background:bcFlt===v?(v==="thieu"?"#dc2626":v==="du"?"#16a34a":"#4f46e5"):"#f3f4f6",color:bcFlt===v?"#fff":"#374151",padding:"5px 12px",fontSize:11}}>{l}</button>
                  ))}
                </div>
              </div>
              {Object.entries(nhomDM).map(([dm,items])=>{
                const fil=items.filter(v=>bcFlt==="all"||(bcFlt==="thieu"&&!v.done)||(bcFlt==="du"&&v.done));
                if(fil.length===0)return null;
                const isO=bcDmO[dm]!==false;
                const dC=fil.reduce((s,v)=>s+v.cn,0),dD=fil.reduce((s,v)=>s+v.dn,0),dT=fil.reduce((s,v)=>s+v.ct,0);
                const dDn=fil.every(v=>v.done);
                return(
                  <div key={dm} style={{background:"#fff",borderRadius:10,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.07)",marginBottom:10,border:`1px solid ${dDn?"#bbf7d0":"#e5e7eb"}`}}>
                    <div onClick={()=>togDm(dm)} style={{padding:"10px 16px",background:dDn?"#f0fdf4":"#f8fafc",borderBottom:isO?"1px solid #e5e7eb":"none",display:"flex",alignItems:"center",gap:10,cursor:"pointer",userSelect:"none"}}>
                      <span>{isO?"▾":"▸"}</span>
                      <span style={{fontWeight:700,fontSize:13,color:dDn?"#065f46":"#1f2937"}}>{dm}</span>
                      {dDn&&<span>✅</span>}
                      <span style={{fontSize:11,color:"#6b7280"}}>{fil.length} mã</span>
                      <div style={{flex:1}}/>
                      <span style={{fontSize:11,color:"#6b7280"}}>Cần: <b>{fmt(dC)}</b></span>
                      <span style={{fontSize:11,color:"#065f46"}}>Đã nhận: <b>{fmt(dD)}</b></span>
                      <span style={{fontSize:11,color:dDn?"#16a34a":"#dc2626"}}>Thiếu: <b>{fmt(dT)}</b></span>
                    </div>
                    {isO&&(
                      <div style={{overflowX:"auto"}}>
                        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                          <thead>
                            <tr style={{background:"#f8fafc",borderBottom:"1px solid #e5e7eb"}}>
                              {["STT","Mã số","Tên","ĐVT","ĐM",`Cần(×${soXe})`,"Đã nhận","Thiếu","Vượt","Tiến độ","Phiếu"].map((h,i)=>(
                                <th key={i} style={{padding:"7px 10px",textAlign:i>=4?"center":"left",fontWeight:700,color:"#6b7280",fontSize:11,whiteSpace:"nowrap"}}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {fil.map((v,ri)=>(
                              <Fragment key={v.ma}>
                                <tr style={{borderBottom:"1px solid #f1f5f9",background:v.done?"#f0fdf4":ri%2===0?"#fff":"#fafafa"}}>
                                  <td style={{padding:"7px 10px",textAlign:"center",color:"#9ca3af",fontSize:11}}>{v.stt}</td>
                                  <td style={{padding:"7px 10px",fontWeight:700,color:mauP,fontFamily:"monospace",fontSize:10,whiteSpace:"nowrap"}}>{v.ma}</td>
                                  <td style={{padding:"7px 10px",maxWidth:180}}><span title={v.ten}>{v.ten.length>35?v.ten.slice(0,35)+"…":v.ten}</span></td>
                                  <td style={{padding:"7px 10px",color:"#6b7280",textAlign:"center"}}>{v.dv}</td>
                                  <td style={{padding:"7px 10px",textAlign:"center",color:"#6b7280"}}>{fmt(v.dm)}</td>
                                  <td style={{padding:"7px 10px",textAlign:"center",fontWeight:700}}>{fmt(v.cn)}</td>
                                  <td style={{padding:"7px 10px",textAlign:"center",fontWeight:700,color:v.dn>0?"#065f46":"#9ca3af"}}>{fmt(v.dn)}</td>
                                  <td style={{padding:"7px 10px",textAlign:"center",fontWeight:700,color:v.done?"#16a34a":"#dc2626"}}>{v.done?"✅":fmt(v.ct)}</td>
                                  <td style={{padding:"7px 10px",textAlign:"center",fontSize:11}}>{v.vt>0?<span style={{background:"#fef3c7",padding:"1px 6px",borderRadius:8,fontWeight:700,color:"#b45309"}}>+{fmt(v.vt)}</span>:"—"}</td>
                                  <td style={{padding:"7px 10px",minWidth:90}}>
                                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                                      <Prog p={v.p} done={v.done}/>
                                      <span style={{fontSize:10,fontWeight:700,minWidth:30,color:v.done?"#16a34a":"#6b7280"}}>{v.p}%</span>
                                    </div>
                                  </td>
                                  <td style={{padding:"7px 10px",textAlign:"center"}}>
                                    {v.phs.length>0&&(
                                      <button onClick={()=>togExp(v.ma)} style={{...btn,background:"#eff6ff",color:"#1d4ed8",padding:"2px 8px",fontSize:10}}>
                                        {bcExp[v.ma]?"▲ Ẩn":`▼ ${v.phs.length} phiếu`}
                                      </button>
                                    )}
                                  </td>
                                </tr>
                                {bcExp[v.ma]&&v.phs.map((ph,pi)=>{
                                  const cumSl=v.phs.slice(0,pi+1).reduce((s,x)=>s+x.sl,0);
                                  const cumP=v.cn>0?Math.min(100,Math.round(cumSl/v.cn*100)):0;
                                  const prevSl=pi===0?0:v.phs.slice(0,pi).reduce((s,x)=>s+x.sl,0);
                                  const reached=cumSl>=v.cn&&prevSl<v.cn;
                                  return(
                                    <tr key={pi} style={{background:reached?"#ecfdf5":"#f8faff",borderBottom:"1px solid #e0e7ff"}}>
                                      <td colSpan={4} style={{padding:"5px 10px 5px 36px",fontSize:11,color:"#6b7280"}}>
                                        {reached&&<span style={{color:"#16a34a",fontWeight:700,marginRight:6}}>✅ Đủ tại đây!</span>}
                                        📄 {ph.sp} · {ph.ngay}
                                      </td>
                                      <td style={{padding:"5px 10px",textAlign:"center",fontSize:11,fontWeight:700,color:"#1d4ed8"}}>+{fmt(ph.sl)}</td>
                                      <td/>
                                      <td style={{padding:"5px 10px",textAlign:"center",fontSize:11,fontWeight:700,color:"#065f46"}}>{fmt(cumSl)}</td>
                                      <td style={{padding:"5px 10px",textAlign:"center",fontSize:11,color:cumSl>=v.cn?"#16a34a":"#dc2626",fontWeight:700}}>{cumSl>=v.cn?"✅":fmt(v.cn-cumSl)}</td>
                                      <td/>
                                      <td style={{padding:"5px 10px"}}>
                                        <div style={{display:"flex",alignItems:"center",gap:4}}>
                                          <div style={{flex:1,height:6,background:"#e5e7eb",borderRadius:99,overflow:"hidden"}}>
                                            <div style={{width:`${cumP}%`,height:"100%",background:cumSl>=v.cn?"#16a34a":"#3b82f6",borderRadius:99}}/>
                                          </div>
                                          <span style={{fontSize:9,color:"#6b7280",minWidth:28}}>{cumP}%</span>
                                        </div>
                                      </td>
                                      <td/>
                                    </tr>
                                  );
                                })}
                              </Fragment>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr style={{background:dDn?"#f0fdf4":"#f8fafc",borderTop:"2px solid #e5e7eb"}}>
                              <td colSpan={4} style={{padding:"8px 10px",fontWeight:700,fontSize:12}}>Cộng {dm}</td>
                              <td/><td style={{padding:"8px 10px",textAlign:"center",fontWeight:700}}>{fmt(dC)}</td>
                              <td style={{padding:"8px 10px",textAlign:"center",fontWeight:700,color:"#065f46"}}>{fmt(dD)}</td>
                              <td style={{padding:"8px 10px",textAlign:"center",fontWeight:700,color:dDn?"#16a34a":"#dc2626"}}>{dDn?"✅":fmt(dT)}</td>
                              <td colSpan={3}/>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
              <div style={{background:duAll?"#f0fdf4":"#eff6ff",border:`2px solid ${duAll?"#16a34a":"#4f46e5"}`,borderRadius:10,padding:"14px 20px",display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
                <span style={{fontWeight:700,fontSize:14,color:duAll?"#065f46":"#312e81"}}>{duAll?"✅ TỔNG KẾT — ĐÃ NHẬN ĐỦ":"📊 TỔNG KẾT TOÀN DỰ ÁN"}</span>
                {[["Tổng cần",fmt(totCN),"#374151"],["Đã nhận",fmt(totDN),"#065f46"],["Còn thiếu",fmt(totCT),totCT>0?"#dc2626":"#16a34a"],["Vượt KH",fmt(totVT),totVT>0?"#b45309":"#9ca3af"],["Hoàn thành",`${maDone}/${bom.length}`,"#4f46e5"],["Tiến độ",`${pctT}%`,duAll?"#16a34a":"#f59e0b"]].map(([l,v,c])=>(
                  <div key={l} style={{textAlign:"center"}}>
                    <div style={{fontWeight:700,fontSize:15,color:c}}>{v}</div>
                    <div style={{fontSize:10,color:"#9ca3af"}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ── LỊCH SỬ ── */}
        {/* ── LỊCH SỬ ── */}
        {tab==="ls"&&(
          <div style={{background:"#fff",borderRadius:10,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
            {ls.length===0?(
              <div style={{textAlign:"center",padding:60,color:"#9ca3af"}}><div style={{fontSize:40,marginBottom:10}}>📋</div><div>Chưa có giao dịch</div></div>
            ):(
              <div>
                <div style={{padding:"10px 14px",borderBottom:"1px solid #e5e7eb",fontWeight:700,fontSize:13}}>{proj.icon} {proj.ten} — Lịch sử ({ls.length})</div>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                    <thead>
                      <tr style={{background:"#f8fafc",borderBottom:"2px solid #e5e7eb"}}>
                        {["Thời gian","Mã VT","Tên VT","Loại","SL","Ghi chú"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontWeight:700,color:"#374151"}}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {ls.map((r,i)=>(
                        <tr key={i} style={{borderBottom:"1px solid #f1f5f9",background:i%2===0?"#fff":"#f9fafb"}}>
                          <td style={{padding:"7px 12px",color:"#6b7280",whiteSpace:"nowrap",fontSize:11}}>{new Date(r.ts).toLocaleString("vi-VN")}</td>
                          <td style={{padding:"7px 12px",fontWeight:700,color:mauP,fontFamily:"monospace",fontSize:11}}>{r.ma}</td>
                          <td style={{padding:"7px 12px",fontSize:12}}>{r.ten}</td>
                          <td style={{padding:"7px 12px"}}>
                            <Tag bg={r.loai==="Xuất kho"?"#fee2e2":r.loai==="Tạo mới"?"#f3e8ff":"#d1fae5"} c={r.loai==="Xuất kho"?"#991b1b":r.loai==="Tạo mới"?"#7c3aed":"#065f46"} ch={r.loai}/>
                          </td>
                          <td style={{padding:"7px 12px",fontWeight:700,color:r.sl<0?"#dc2626":"#16a34a",textAlign:"right"}}>{r.sl>0?"+":""}{fmt(r.sl)}</td>
                          <td style={{padding:"7px 12px",color:"#6b7280"}}>{r.gc||"—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── THỐNG KÊ ── */}
        {/* ── THỐNG KÊ ── */}
        {tab==="tk"&&(
          <div>
            <div style={{background:"#fff",borderRadius:10,padding:"14px 18px",marginBottom:16,boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>📊 Tổng quan tất cả dự án</div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                {projs.map(p=>(
                  <div key={p.id} onClick={()=>sw(p.id)} style={{flex:"1 1 150px",border:`2px solid ${p.id===pid?(p.mau||"#2563eb"):"#e5e7eb"}`,borderRadius:10,padding:"12px 14px",cursor:"pointer",background:p.id===pid?"#f8fafc":"#fff"}}>
                    <div style={{fontSize:20,marginBottom:4}}>{p.icon}</div>
                    <div style={{fontWeight:700,color:p.mau||"#2563eb",fontSize:14}}>{p.ten}</div>
                    <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>{p.mo_ta}</div>
                    <div style={{fontSize:11,color:"#374151",marginTop:4,fontWeight:700}}>{fmt((bomDB[p.id]||[]).length)} mã VT · <span style={{color:"#065f46"}}>🚌 {p.so_xe||1} xe</span></div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:16}}>
              {[["📦","Mã vật tư",fmt(bom.length),mauP],["🗂️","Danh mục",[...new Set(bom.map(v=>v.dmuc))].length,"#7c3aed"],["🔩","Tổng ĐM/1XE",fmt(bom.reduce((s,v)=>s+v.dm,0)),"#16a34a"],["🖼️","Có ảnh",fmt(bom.filter(v=>v.anh).length),"#ea580c"]].map(([ic,l,v,c])=>(
                <div key={l} style={{background:"#fff",borderRadius:10,padding:"12px 16px",boxShadow:"0 1px 4px rgba(0,0,0,0.08)",borderLeft:`4px solid ${c}`}}>
                  <div style={{fontSize:20,marginBottom:5}}>{ic}</div>
                  <div style={{fontSize:20,fontWeight:700,color:c}}>{v}</div>
                  <div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{background:"#fff",borderRadius:10,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
              <div style={{padding:"11px 16px",borderBottom:"1px solid #e5e7eb",fontWeight:700,fontSize:13}}>{proj.icon} {proj.ten} — Theo danh mục</div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr style={{background:"#f8fafc",borderBottom:"2px solid #e5e7eb"}}>
                  {["Danh mục","Số mã","Tổng ĐM","Tỉ lệ"].map(h=><th key={h} style={{padding:"8px 14px",textAlign:h==="Danh mục"?"left":"right",fontWeight:700,color:"#374151"}}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {statDM.map(([dm,s],i)=>{
                    const tot=bom.reduce((a,v)=>a+v.dm,0)||1;
                    return(
                      <tr key={dm} style={{borderBottom:"1px solid #f1f5f9",background:i%2===0?"#fff":"#f9fafb"}}>
                        <td style={{padding:"8px 14px"}}><Tag ch={dm}/></td>
                        <td style={{padding:"8px 14px",textAlign:"right"}}>{s.n}</td>
                        <td style={{padding:"8px 14px",textAlign:"right",fontWeight:700,color:"#16a34a"}}>{fmt(s.t)}</td>
                        <td style={{padding:"8px 14px",textAlign:"right"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"flex-end"}}>
                            <div style={{width:70,height:7,background:"#e5e7eb",borderRadius:4,overflow:"hidden"}}>
                              <div style={{width:`${(s.t/tot*100).toFixed(0)}%`,height:"100%",background:mauP,borderRadius:4}}/>
                            </div>
                            <span style={{fontSize:11,color:"#6b7280",minWidth:34}}>{(s.t/tot*100).toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* ── NGƯỜI DÙNG — chỉ Xưởng Hàn ── */}
        {tab==="users"&&isXH&&(
          <UsersPanel currentUser={user} users={users} setUsers={setUsers} dbUpsertUser={dbUpsertUser} dbDeleteUser={dbDeleteUser}/>
        )}

      </div>


      {/* ── MODALS ── */}
      {(modal||newP)&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:12}}
          onClick={e=>{if(e.target===e.currentTarget){setModal(null);setNewP(false);}}}>
          <div style={{background:"#fff",borderRadius:12,padding:22,width:"100%",maxWidth:520,boxShadow:"0 20px 60px rgba(0,0,0,0.2)",maxHeight:"92vh",overflowY:"auto"}}>

            {(modal==="add"||modal==="edit")&&(
              <div>
                <h3 style={{margin:"0 0 16px",fontSize:15}}>{modal==="add"?"➕ Thêm vật tư":"✏️ Cập nhật"} — {proj.icon} {proj.ten}</h3>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {[["Mã số *","ma","text",modal==="edit"],["Tên vật tư *","ten","text",false],["Đơn vị","dv","text",false],["Vị trí","vt","text",false],["ĐM/1XE","dm","number",false]].map(([lb,k,tp,dis])=>(
                    <div key={k} style={{gridColumn:(k==="ten"||k==="dm")?"1/3":"auto"}}>
                      <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>{lb}</label>
                      <input type={tp} value={cur[k]||""} disabled={dis} onChange={e=>setCur(c=>({...c,[k]:tp==="number"?Number(e.target.value):e.target.value}))}
                        style={{...inp,background:dis?"#f9fafb":"#fff",color:dis?"#9ca3af":"inherit"}}/>
                    </div>
                  ))}
                  <div style={{gridColumn:"1/3"}}>
                    <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Danh mục</label>
                    <input value={cur.dmuc||""} onChange={e=>setCur(c=>({...c,dmuc:e.target.value}))} list="dml" style={inp} placeholder="Nhập hoặc chọn..."/>
                    <datalist id="dml">{DMS.map(d=><option key={d} value={d}/>)}</datalist>
                  </div>
                  <div style={{gridColumn:"1/3"}}>
                    <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Ghi chú</label>
                    <input value={cur.gc||""} onChange={e=>setCur(c=>({...c,gc:e.target.value}))} style={inp}/>
                  </div>
                  <div style={{gridColumn:"1/3"}}>
                    <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:6}}>Ảnh vật tư</label>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      {cur.anh
                        ?<img src={cur.anh} alt="" onClick={()=>setAnhPv(cur.anh)} style={{width:68,height:68,objectFit:"cover",borderRadius:8,border:"1px solid #e5e7eb",cursor:"zoom-in"}}/>
                        :<div style={{width:68,height:68,borderRadius:8,border:"2px dashed #d1d5db",display:"flex",alignItems:"center",justifyContent:"center",color:"#d1d5db",fontSize:26}}>🖼</div>}
                      <div>
                        <input ref={fRef} type="file" accept="image/*" style={{display:"none"}} onChange={hdAnh}/>
                        <button onClick={()=>fRef.current.click()} style={{...btn,background:"#eff6ff",color:"#1d4ed8",padding:"6px 14px"}}>{cur.anh?"🔄 Đổi":"📷 Chọn ảnh"}</button>
                        {cur.anh&&<button onClick={()=>setCur(c=>({...c,anh:""}))} style={{...btn,background:"#fee2e2",color:"#991b1b",padding:"6px 10px",marginLeft:6}}>Xóa</button>}
                        <div style={{fontSize:10,color:"#9ca3af",marginTop:4}}>JPG, PNG · Max 5MB</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,marginTop:18,justifyContent:"flex-end"}}>
                  <button onClick={()=>setModal(null)} style={{...btn,background:"#f3f4f6",color:"#374151",padding:"7px 16px"}}>Hủy</button>
                  <button onClick={save} style={{...btn,background:mauP,color:"#fff",padding:"7px 16px"}}>{modal==="add"?"Thêm":"Lưu"}</button>
                </div>
              </div>
            )}

            {(modal==="nhap"||modal==="xuat")&&(
              <div>
                <h3 style={{margin:"0 0 6px"}}>{modal==="nhap"?"📥 Nhập kho":"📤 Xuất kho"}</h3>
                <p style={{margin:"0 0 12px",color:"#6b7280",fontSize:11,fontFamily:"monospace"}}>{cur.stt}. {cur.ma} — {cur.ten}</p>
                <div style={{background:"#f8fafc",borderRadius:8,padding:"9px 13px",marginBottom:12,fontSize:12}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#6b7280"}}>ĐM/1XE:</span><b>{fmt(cur.dm)} {cur.dv}</b></div>
                </div>
                <div style={{marginBottom:10}}>
                  <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Số lượng</label>
                  <input type="number" min={1} value={slXT} onChange={e=>setSlXT(e.target.value)} style={inp}/>
                </div>
                <div style={{marginBottom:16}}>
                  <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Ghi chú</label>
                  <input value={gcXT} onChange={e=>setGcXT(e.target.value)} style={inp}/>
                </div>
                <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                  <button onClick={()=>setModal(null)} style={{...btn,background:"#f3f4f6",color:"#374151",padding:"7px 16px"}}>Hủy</button>
                  <button onClick={doIO} style={{...btn,background:modal==="nhap"?"#16a34a":"#dc2626",color:"#fff",padding:"7px 16px"}}>{modal==="nhap"?"Xác nhận nhập":"Xác nhận xuất"}</button>
                </div>
              </div>
            )}

            {newP&&(
              <div>
                <h3 style={{margin:"0 0 16px",fontSize:15}}>🆕 Thêm dự án mới</h3>
                <div style={{display:"grid",gap:11}}>
                  <div>
                    <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Tên dự án *</label>
                    <input value={nPF.ten} onChange={e=>setNPF(f=>({...f,ten:e.target.value}))} style={inp} placeholder="Tên dự án..."/>
                  </div>
                  <div>
                    <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Mô tả</label>
                    <input value={nPF.moTa} onChange={e=>setNPF(f=>({...f,moTa:e.target.value}))} style={inp} placeholder="Mô tả..."/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div>
                      <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Icon</label>
                      <input value={nPF.icon} onChange={e=>setNPF(f=>({...f,icon:e.target.value}))} style={inp} placeholder="📦"/>
                    </div>
                    <div>
                      <label style={{display:"block",fontSize:11,fontWeight:700,color:"#065f46",marginBottom:3}}>🚌 Số xe *</label>
                      <input type="number" min={1} value={nPF.so_xe} onChange={e=>setNPF(f=>({...f,so_xe:parseInt(e.target.value)||1}))}
                        style={{...inp,fontWeight:700,color:"#065f46",border:"1px solid #6ee7b7"}}/>
                    </div>
                  </div>
                  <div>
                    <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:6}}>📋 BOM mẫu</label>
                    {[{v:"trong",l:"📄 Dự án trống",d:"Tự thêm vật tư thủ công",c:"#6b7280"},{v:"xh",l:"🔧 Sao chép BOM Xưởng Hàn",d:`${BOM_XH.length} mã`,c:"#1d4ed8"},{v:"mb2",l:"🚌 Sao chép BOM Minibus 2",d:`${BOM_MB2.length} mã`,c:"#b45309"}].map(o=>(
                      <div key={o.v} onClick={()=>setNPF(f=>({...f,bom:o.v}))}
                        style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,border:`2px solid ${nPF.bom===o.v?o.c:"#e5e7eb"}`,background:nPF.bom===o.v?"#f8fafc":"#fff",cursor:"pointer",marginBottom:6}}>
                        <div style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${o.c}`,background:nPF.bom===o.v?o.c:"transparent",flexShrink:0}}/>
                        <div>
                          <div style={{fontWeight:700,fontSize:13,color:nPF.bom===o.v?o.c:"#374151"}}>{o.l}</div>
                          <div style={{fontSize:11,color:"#9ca3af"}}>{o.d}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Màu sắc</label>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {["#1d4ed8","#16a34a","#dc2626","#b45309","#7c3aed","#0891b2","#1f2937"].map(c=>(
                        <div key={c} onClick={()=>setNPF(f=>({...f,mau:c}))}
                          style={{width:28,height:28,borderRadius:"50%",background:c,cursor:"pointer",border:nPF.mau===c?"3px solid #000":"3px solid transparent"}}/>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,marginTop:18,justifyContent:"flex-end"}}>
                  <button onClick={()=>setNewP(false)} style={{...btn,background:"#f3f4f6",color:"#374151",padding:"7px 16px"}}>Hủy</button>
                  <button onClick={mkProj} style={{...btn,background:nPF.mau,color:"#fff",padding:"7px 16px"}}>Tạo dự án</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TẠO PHIẾU MODAL ── */}
      {showPh&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:12}}
          onClick={e=>{if(e.target===e.currentTarget)setShowPh(false);}}>
          <div style={{background:"#fff",borderRadius:12,padding:22,width:"100%",maxWidth:600,boxShadow:"0 20px 60px rgba(0,0,0,0.2)",maxHeight:"92vh",overflowY:"auto"}}>
            <h3 style={{margin:"0 0 16px",fontSize:15}}>📋 Tạo Phiếu Giao Nhận</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Số phiếu</label>
                <input value={phF.sp} onChange={e=>setPhF(f=>({...f,sp:e.target.value}))} style={inp}/>
              </div>
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Ngày</label>
                <input type="date" value={phF.ngay} onChange={e=>setPhF(f=>({...f,ngay:e.target.value}))} style={inp}/>
              </div>
              <div style={{gridColumn:"1/3"}}>
                <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Ghi chú</label>
                <input value={phF.gc} onChange={e=>setPhF(f=>({...f,gc:e.target.value}))} style={inp}/>
              </div>
            </div>
            <div style={{background:"#f8fafc",borderRadius:8,padding:14,marginBottom:14}}>
              <div style={{fontWeight:700,fontSize:12,marginBottom:10}}>Thêm vật tư vào phiếu</div>
              <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
                <div style={{flex:1}}>
                  <label style={{display:"block",fontSize:10,fontWeight:700,color:"#6b7280",marginBottom:3}}>Mã vật tư</label>
                  <select value={addIt.ma} onChange={e=>setAddIt(a=>({...a,ma:e.target.value}))} style={inp}>
                    <option value="">-- Chọn mã --</option>
                    {bom.map(v=><option key={v.ma} value={v.ma}>{v.ma} — {v.ten.slice(0,40)}</option>)}
                  </select>
                </div>
                <div style={{width:80}}>
                  <label style={{display:"block",fontSize:10,fontWeight:700,color:"#6b7280",marginBottom:3}}>Số lượng</label>
                  <input type="number" min={1} value={addIt.sl} onChange={e=>setAddIt(a=>({...a,sl:parseInt(e.target.value)||1}))} style={inp}/>
                </div>
                <button onClick={addPhIt} style={{...btn,background:"#2563eb",color:"#fff",padding:"7px 14px"}}>+ Thêm</button>
              </div>
            </div>
            {phIt.length>0&&(
              <div style={{border:"1px solid #e5e7eb",borderRadius:8,overflow:"hidden",marginBottom:16}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead><tr style={{background:"#f8fafc"}}>
                    {["STT","Mã số","Tên","ĐVT","SL",""].map(h=><th key={h} style={{padding:"7px 10px",textAlign:"left",fontWeight:700,color:"#6b7280"}}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {phIt.map((it,i)=>(
                      <tr key={i} style={{borderTop:"1px solid #f1f5f9"}}>
                        <td style={{padding:"6px 10px",color:"#9ca3af"}}>{i+1}</td>
                        <td style={{padding:"6px 10px",fontWeight:700,color:"#1e40af",fontFamily:"monospace",fontSize:11}}>{it.ma}</td>
                        <td style={{padding:"6px 10px"}}>{it.ten}</td>
                        <td style={{padding:"6px 10px",color:"#6b7280"}}>{it.dv}</td>
                        <td style={{padding:"6px 10px",fontWeight:700,color:"#16a34a"}}>{fmt(it.sl)}</td>
                        <td style={{padding:"6px 10px"}}>
                          <button onClick={()=>setPhIt(ps=>ps.filter((_,j)=>j!==i))} style={{...btn,background:"#fee2e2",color:"#991b1b",padding:"2px 8px",fontSize:11}}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>setShowPh(false)} style={{...btn,background:"#f3f4f6",color:"#374151",padding:"7px 16px"}}>Hủy</button>
              <button onClick={submitPh} disabled={!phF.sp||phIt.length===0}
                style={{...btn,background:mauP,color:"#fff",padding:"7px 16px",opacity:(!phF.sp||phIt.length===0)?.5:1}}>
                Tạo phiếu ({phIt.length} mã)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── XEM PHIẾU MODAL ── */}
      {freshVP&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:12}}
          onClick={e=>{if(e.target===e.currentTarget)setViewPh(null);}}>
          <div style={{background:"#fff",borderRadius:12,padding:22,width:"100%",maxWidth:720,boxShadow:"0 20px 60px rgba(0,0,0,0.2)",maxHeight:"92vh",overflowY:"auto"}}>
            <div style={{textAlign:"center",marginBottom:16}}>
              <div style={{fontWeight:700,fontSize:14}}>PHIẾU GIAO NHẬN VẬT TƯ</div>
              <div style={{fontSize:12,color:"#6b7280"}}>Số phiếu: <b style={{color:"#1d4ed8"}}>{freshVP.sp}</b> · Ngày: <b>{freshVP.ngay}</b></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14,background:"#f8fafc",borderRadius:8,padding:"12px 16px",fontSize:12}}>
              <div><span style={{color:"#6b7280"}}>Bên giao:</span> <b style={{color:"#dc2626"}}>{freshVP.bg}</b></div>
              <div><span style={{color:"#6b7280"}}>Bên nhận:</span> <b style={{color:"#1d4ed8"}}>{freshVP.bn}</b></div>
              <div><span style={{color:"#6b7280"}}>Trạng thái:</span> <Tag bg={freshVP.tt==="Đã xác nhận"?"#d1fae5":"#fef3c7"} c={freshVP.tt==="Đã xác nhận"?"#065f46":"#92400e"} ch={freshVP.tt}/></div>
              {freshVP.gc&&<div><span style={{color:"#6b7280"}}>Ghi chú:</span> {freshVP.gc}</div>}
            </div>
            <div style={{overflowX:"auto",marginBottom:14}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr style={{background:"#f8fafc",borderBottom:"2px solid #e5e7eb"}}>
                  {["STT","Mã số","Tên vật tư","ĐVT","Số lượng","Duyệt"].map(h=><th key={h} style={{padding:"8px 10px",textAlign:"left",fontWeight:700,color:"#374151"}}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {(freshVP.ct||[]).map((c,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid #f1f5f9",background:i%2===0?"#fff":"#f9fafb"}}>
                      <td style={{padding:"7px 10px",color:"#9ca3af"}}>{c.stt}</td>
                      <td style={{padding:"7px 10px",fontWeight:700,color:"#1e40af",fontFamily:"monospace",fontSize:11}}>{c.ma}</td>
                      <td style={{padding:"7px 10px"}}>{c.ten}</td>
                      <td style={{padding:"7px 10px",color:"#6b7280"}}>{c.dv}</td>
                      <td style={{padding:"7px 10px",fontWeight:700,color:"#16a34a",textAlign:"right"}}>{fmt(c.sl)}</td>
                      <td style={{padding:"7px 10px",textAlign:"center"}}>
                        {c.ok
                          ?<span style={{color:"#16a34a",fontSize:16}}>✅</span>
                          :isXH?<button onClick={()=>duyetCt(freshVP.id,c.id)} style={{...btn,background:"#2563eb",color:"#fff",padding:"4px 12px",fontSize:11}}>Duyệt</button>:<span style={{color:"#9ca3af",fontSize:11}}>Chờ XH</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{background:"#f8fafc",borderTop:"2px solid #e5e7eb"}}>
                    <td colSpan={3} style={{padding:"8px 10px",fontWeight:700}}>Tổng cộng</td>
                    <td style={{padding:"8px 10px",fontWeight:700,textAlign:"center"}}>{freshVP.tong} chủng loại</td>
                    <td style={{padding:"8px 10px",fontWeight:700,color:"#16a34a",textAlign:"right"}}>{fmt((freshVP.ct||[]).reduce((s,c)=>s+c.sl,0))}</td>
                    <td style={{padding:"8px 10px",textAlign:"center",fontSize:11,color:"#6b7280"}}>{(freshVP.ct||[]).filter(c=>c.ok).length}/{(freshVP.ct||[]).length} duyệt</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {(()=>{
              const ct=freshVP.ct||[];
              const dd=ct.filter(c=>c.ok).length;
              const all=ct.length>0&&dd===ct.length;
              return(
                <div style={{background:all?"#f0fdf4":"#fffbeb",border:`2px solid ${all?"#16a34a":"#f59e0b"}`,borderRadius:10,padding:"14px 18px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:13,color:all?"#065f46":"#92400e"}}>{all?"✅ Xưởng Hàn đã duyệt toàn bộ":`⏳ Còn ${ct.length-dd} mã chưa duyệt`}</div>
                    <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>Bên nhận: <b style={{color:"#1d4ed8"}}>XƯỞNG HÀN</b> · {dd}/{ct.length} đã duyệt</div>
                  </div>
                  {!all&&ct.length>0&&isXH&&<button onClick={()=>duyetAll(freshVP.id)} style={{...btn,background:"#1d4ed8",color:"#fff",padding:"10px 22px",fontSize:13,fontWeight:700}}>✓ Duyệt tất cả</button>}
                  {all&&<div style={{background:"#16a34a",color:"#fff",borderRadius:8,padding:"8px 18px",fontSize:13,fontWeight:700}}>✅ Hoàn tất giao nhận</div>}
                </div>
              );
            })()}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:16}}>
              {[["Đại diện bên giao","LINH KIỆN BUS"],["Đại diện bên nhận","XƯỞNG HÀN"]].map(([lb,nm])=>(
                <div key={nm} style={{textAlign:"center"}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#374151",marginBottom:4}}>{lb}</div>
                  <div style={{fontSize:11,color:"#6b7280",marginBottom:40}}>{nm}</div>
                  <div style={{borderTop:"1px solid #d1d5db",paddingTop:6,fontSize:11,color:"#9ca3af"}}>(Ký, ghi rõ họ tên)</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>window.print()} style={{...btn,background:"#f3f4f6",color:"#374151",padding:"8px 16px",fontSize:13}}>🖨 In phiếu</button>
              {isXH&&freshVP.tt!=="Đã xác nhận"&&<button onClick={()=>{xacNhan(freshVP.id);setViewPh(null);}} style={{...btn,background:"#16a34a",color:"#fff",padding:"8px 16px",fontSize:13}}>✓ Xác nhận</button>}
              <button onClick={()=>setViewPh(null)} style={{...btn,background:"#2563eb",color:"#fff",padding:"8px 16px",fontSize:13}}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* ── IMPORT BOM MODAL ── */}
      {showXlsImport&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:12}}
          onClick={e=>{if(e.target===e.currentTarget){setShowXlsImport(false);setXlsPreview([]);setXlsErr("");}}}>
          <div style={{background:"#fff",borderRadius:12,padding:22,width:"100%",maxWidth:560,boxShadow:"0 20px 60px rgba(0,0,0,0.2)",maxHeight:"92vh",overflowY:"auto"}}>
            <h3 style={{margin:"0 0 6px",fontSize:15}}>📊 Import BOM từ Excel</h3>
            <p style={{margin:"0 0 14px",color:"#6b7280",fontSize:12}}>File Excel cần có các cột: <b>Mã số, Tên vật tư, ĐVT, ĐM/1XE, Danh mục, Vị trí, Ghi chú</b></p>
            <div style={{background:"#f8fafc",borderRadius:8,padding:"12px 16px",marginBottom:14,fontSize:12,color:"#374151"}}>
              <div style={{fontWeight:700,marginBottom:6}}>Tên cột hợp lệ:</div>
              <div>STT · <b>Mã số</b> · <b>Tên vật tư</b> · ĐVT · ĐM/1XE · Danh mục · Vị trí · Ghi chú</div>
            </div>
            <input ref={xlsRef} type="file" accept=".xlsx,.xls,.csv" style={{display:"none"}} onChange={handleXlsFile}/>
            <button onClick={()=>xlsRef.current.click()} style={{...btn,background:"#065f46",color:"#fff",padding:"9px 18px",fontSize:13,marginBottom:12,width:"100%"}}>
              📂 Chọn file Excel (.xlsx / .xls / .csv)
            </button>
            {xlsErr&&<div style={{background:"#fee2e2",borderRadius:8,padding:"9px 13px",fontSize:12,color:"#991b1b",marginBottom:12}}>⚠️ {xlsErr}</div>}
            {xlsPreview.length>0&&(
              <div>
                <div style={{fontWeight:700,fontSize:13,marginBottom:8,color:"#065f46"}}>✓ Đọc được {xlsPreview.length} mã vật tư</div>
                <div style={{overflowX:"auto",maxHeight:220,overflowY:"auto",border:"1px solid #e5e7eb",borderRadius:8,marginBottom:14}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                    <thead><tr style={{background:"#f8fafc",position:"sticky",top:0}}>
                      {["STT","Mã số","Tên vật tư","ĐVT","ĐM","Danh mục"].map(h=><th key={h} style={{padding:"6px 8px",textAlign:"left",fontWeight:700,color:"#374151",borderBottom:"1px solid #e5e7eb"}}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {xlsPreview.slice(0,10).map((v,i)=>(
                        <tr key={i} style={{borderBottom:"1px solid #f1f5f9"}}>
                          <td style={{padding:"5px 8px",color:"#9ca3af"}}>{v.stt}</td>
                          <td style={{padding:"5px 8px",fontWeight:700,color:mauP,fontFamily:"monospace"}}>{v.ma}</td>
                          <td style={{padding:"5px 8px",maxWidth:160}}>{v.ten}</td>
                          <td style={{padding:"5px 8px",color:"#6b7280"}}>{v.dv}</td>
                          <td style={{padding:"5px 8px",textAlign:"center"}}>{v.dm}</td>
                          <td style={{padding:"5px 8px",color:"#6b7280"}}>{v.dmuc}</td>
                        </tr>
                      ))}
                      {xlsPreview.length>10&&<tr><td colSpan={6} style={{padding:"6px 8px",color:"#9ca3af",textAlign:"center"}}>...và {xlsPreview.length-10} mã nữa</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                  <button onClick={()=>{setShowXlsImport(false);setXlsPreview([]);setXlsErr("");}} style={{...btn,background:"#f3f4f6",color:"#374151",padding:"7px 14px"}}>Hủy</button>
                  <button onClick={()=>{if(window.confirm(`Thêm ${xlsPreview.length} mã vào BOM hiện tại?`))doXlsImport("them");}} style={{...btn,background:"#16a34a",color:"#fff",padding:"7px 16px"}}>➕ Thêm vào</button>
                  <button onClick={()=>{if(window.confirm(`Thay thế toàn bộ BOM bằng ${xlsPreview.length} mã từ Excel?`))doXlsImport("thay");}} style={{...btn,background:"#dc2626",color:"#fff",padding:"7px 16px"}}>🔄 Thay thế</button>
                </div>
              </div>
            )}
            {!xlsPreview.length&&!xlsErr&&(
              <div style={{textAlign:"right",marginTop:8}}>
                <button onClick={()=>{setShowXlsImport(false);setXlsErr("");}} style={{...btn,background:"#f3f4f6",color:"#374151",padding:"7px 14px"}}>Đóng</button>
              </div>
            )}
          </div>
        </div>
      )}
      {showImport&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:12}}
          onClick={e=>{if(e.target===e.currentTarget)setShowImport(false);}}>
          <div style={{background:"#fff",borderRadius:12,padding:24,width:"100%",maxWidth:460,boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
            <h3 style={{margin:"0 0 6px",fontSize:15}}>📥 Import BOM vào dự án</h3>
            <p style={{margin:"0 0 18px",fontSize:12,color:"#6b7280"}}>Dự án hiện tại: <b>{proj.icon} {proj.ten}</b> ({bom.length} mã đang có)</p>

            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:8}}>Chọn BOM nguồn</label>
              {[{v:"xh",l:"🔧 BOM Xưởng Hàn",d:`${BOM_XH.length} mã vật tư`,c:"#1d4ed8"},{v:"mb2",l:"🚌 BOM Minibus 2",d:`${BOM_MB2.length} mã vật tư`,c:"#b45309"}].map(o=>(
                <div key={o.v} onClick={()=>setImportSrc(o.v)}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:8,border:`2px solid ${importSrc===o.v?o.c:"#e5e7eb"}`,background:importSrc===o.v?"#f8fafc":"#fff",cursor:"pointer",marginBottom:8}}>
                  <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${o.c}`,background:importSrc===o.v?o.c:"transparent",flexShrink:0}}/>
                  <div>
                    <div style={{fontWeight:700,fontSize:13,color:importSrc===o.v?o.c:"#374151"}}>{o.l}</div>
                    <div style={{fontSize:11,color:"#9ca3af",marginTop:1}}>{o.d}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{marginBottom:20}}>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:8}}>Cách import</label>
              {[{v:"them",l:"➕ Thêm vào (bỏ qua mã đã có)",c:"#16a34a"},{v:"thay",l:"🔄 Thay thế toàn bộ danh sách",c:"#dc2626"}].map(o=>(
                <div key={o.v} onClick={()=>setImportMode(o.v)}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:8,border:`2px solid ${importMode===o.v?o.c:"#e5e7eb"}`,background:importMode===o.v?"#f8fafc":"#fff",cursor:"pointer",marginBottom:8}}>
                  <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${o.c}`,background:importMode===o.v?o.c:"transparent",flexShrink:0}}/>
                  <div style={{fontWeight:700,fontSize:13,color:importMode===o.v?o.c:"#374151"}}>{o.l}</div>
                </div>
              ))}
              {importMode==="thay"&&bom.length>0&&(
                <div style={{background:"#fef3c7",border:"1px solid #f59e0b",borderRadius:8,padding:"8px 12px",fontSize:11,color:"#92400e"}}>
                  ⚠️ Sẽ xóa toàn bộ {bom.length} mã hiện có và thay bằng BOM mới
                </div>
              )}
            </div>

            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>setShowImport(false)} style={{...btn,background:"#f3f4f6",color:"#374151",padding:"8px 18px",fontSize:13}}>Hủy</button>
              <button onClick={()=>{
                if(importMode==="thay"&&bom.length>0&&!window.confirm(`Xóa ${bom.length} mã hiện có và thay bằng BOM mới?`))return;
                doImport();
              }} style={{...btn,background:importMode==="thay"?"#dc2626":"#16a34a",color:"#fff",padding:"8px 18px",fontSize:13,fontWeight:700}}>
                {importMode==="them"?"➕ Thêm vào dự án":"🔄 Thay thế"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AnhModal src={anhPv} onClose={()=>setAnhPv(null)}/>
    </div>
  );
}
