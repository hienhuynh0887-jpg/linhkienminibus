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
  ["duyet", "✅ Duyệt Đơn"],
  ["pgn",   "📄 Phiếu GN"],
  ["bc",    "📈 Báo Cáo"],
  ["ls",    "🕓 Lịch sử"],
  ["tk",    "📊 Thống kê"],
  ["users", "👥 Người dùng"],
];
const TABS_THCK     = TABS_ALL.filter(([k])=>!["users","duyet"].includes(k));
const TABS_XUONGHAN = TABS_ALL.filter(([k])=>!["soan"].includes(k));

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

  const [selMa,      setSelMa]      = useState(null);  // hàng được click
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
              ten:String(r["Tên Vật Tư"]||r["Tên vật tư"]||r["ten"]||r["TEN"]||r["name"]||"").trim(),
              dv:String(r["Đơn vị"]||r["ĐVT"]||r["dv"]||"Cái").trim(),
              dm:Number(r["Định Mức"]||r["ĐM/1XE"]||r["ĐM"]||r["dm"]||1),
              dmuc:String(r["Danh mục"]||r["dmuc"]||r["Trạm"]||"").trim(),
              vt:String(r["Vị trí"]||r["vt"]||r["Trạm"]||"").trim(),
              gc:String(r["Ghi chú"]||r["gc"]||"").trim(),
            };
          }).filter(r=>r.ma&&r.ten);
          if(!mapped.length){setXlsErr("Không tìm thấy cột Mã số / Tên vật tư!");return;}
          setXlsPreview(mapped);
        }catch(err){setXlsErr("Lỗi đọc CSV: "+err.message);}
      };
      reader.readAsText(file,"UTF-8");
    } else {
      const reader=new FileReader();
      reader.onload=async ev=>{
        try{
          const {read,utils}=await import("xlsx");
          let wb;
          try{
            wb=read(new Uint8Array(ev.target.result),{
              type:"array",cellText:false,cellDates:true,
              cellNF:false,cellStyles:false,WTF:false,
              dense:true,
            });
          }catch{
            // Thử lại với option tối giản hơn
            wb=read(new Uint8Array(ev.target.result),{
              type:"array",WTF:false,dense:false,bookVBA:false,
            });
          }
          const ws=wb.Sheets[wb.SheetNames[0]];
          // Tìm hàng header (bỏ qua hàng tiêu đề gộp ở đầu)
          const allRows=utils.sheet_to_json(ws,{defval:"",raw:false,header:1});
          // Tìm hàng có "Mã số" hoặc "ma"
          let headerIdx=0;
          for(let i=0;i<Math.min(5,allRows.length);i++){
            const row=allRows[i];
            if(row.some(c=>String(c).toLowerCase().includes("mã")&&String(c).toLowerCase().includes("số"))){
              headerIdx=i;break;
            }
          }
          const headers=allRows[headerIdx].map(h=>String(h).trim());
          const dataRows=allRows.slice(headerIdx+1);
          const mapped=dataRows.map((row,i)=>{
            const r={};
            headers.forEach((h,j)=>{r[h]=row[j]??""});
            const ma=String(r["Mã số"]||r["ma"]||r["MA"]||r["id"]||"").trim();
            const ten=String(r["Tên Vật Tư"]||r["Tên vật tư"]||r["ten"]||r["TEN"]||r["name"]||"").trim();
            return{
              stt:Number(r["STT"]||r["stt"])||i+1,
              ma,ten,
              dv:String(r["Đơn vị"]||r["ĐVT"]||r["dv"]||"Cái").trim(),
              dm:Number(r["Định Mức"]||r["ĐM/1XE"]||r["ĐM"]||r["dm"]||1)||1,
              dmuc:String(r["Danh mục"]||r["Trạm"]||r["dmuc"]||"").trim(),
              vt:String(r["Trạm"]||r["Vị trí"]||r["vt"]||"").trim(),
              gc:String(r["Ghi chú"]||r["gc"]||"").trim(),
            };
          }).filter(r=>r.ma&&r.ten);
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
    // Chỉ gửi các mã đã soạn (có tick ✓)
    const daSoan=bom.filter(v=>soan[v.ma]?.on);
    if(daSoan.length===0){flash("⚠️ Chưa soạn mã nào!");return;}
    const ct=daSoan.map((v,i)=>{
      const slCN=v.dm*soXe;
      const slThuc=soan[v.ma]?.sl??slCN;
      return{id:uid(),phid,stt:i+1,ma:v.ma,ten:v.ten,dv:v.dv,sl:slThuc,ok:false};
    });
    const ph={id:phid,pid,sp,ngay:d.toISOString().slice(0,10),gc:`Đơn hàng ${proj.icon} ${proj.ten} — ${soXe} xe (${ct.length} mã)`,bg:"LINH KIỆN BUS",bn:"XƯỞNG HÀN",tt:"Chờ xác nhận",tong:ct.length,ts:d.toISOString(),ct};
    setPhDB(s=>({...s,[pid]:[ph,...(s[pid]||[])]}));
    dbSavePhieu(ph);
    const lsRows=ct.map(c=>({id:uid(),pid,ma:c.ma,ten:c.ten,loai:"Xuất kho",sl:-c.sl,gc:`Đơn ${sp}`,ts:new Date().toISOString()}));
    lsRows.forEach(r=>addLS(pid,r));
    supabase.from("lich_su").insert(lsRows).then(()=>{});
    setSoanDB(s=>({...s,[pid]:{}}));setTab("pgn");flash(`✓ Đã gửi đơn ${sp} (${ct.length} mã)`);
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
    // chuaSoan: chưa có trong bất kỳ phiếu nào
    const chuaSoan=!phByMa[v.ma]||phByMa[v.ma].length===0;
    // giaoThieu: đã có trong phiếu nhưng SL nhận < SL cần
    const giaoThieu=!chuaSoan&&dn<cn;
    return{...v,cn,dn,ct,vt,p,done:dn>=cn,phs:phByMa[v.ma]||[],chuaSoan,giaoThieu};
  }),[bom,dnMap,phByMa,soXe]);

  const maDone=th.filter(v=>v.done).length;
  const maChuaSoan=th.filter(v=>v.chuaSoan).length;
  const maGiaoThieu=th.filter(v=>v.giaoThieu).length;
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
    setTab(u.role==="thck"?"soan":"duyet");
  }}/>;

  const role      = user.role;           // "thck" | "xuonghan"
  const isTHCK    = role==="thck";
  const isXH      = role==="xuonghan";
  const TABS_NOW  = isTHCK ? TABS_THCK : TABS_XUONGHAN;
  const mauRole   = isTHCK ? "#1d4ed8" : "#b45309";

  return(
    <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",background:"#f0f4f8",minHeight:"100vh"}}>

      {/* HEADER */}
      <div style={{backgroundImage:`url(data:image/jpeg;base64,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)`,backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat",position:"relative",color:"#fff"}}>
        {/* Overlay */}
        <div style={{position:"absolute",inset:0,background:isTHCK?"linear-gradient(135deg,rgba(15,36,71,0.82),rgba(29,78,216,0.78))":"linear-gradient(135deg,rgba(59,10,0,0.82),rgba(180,83,9,0.78))",zIndex:0}}/>
        <div style={{position:"relative",zIndex:1}}>
        {/* Top bar */}
        <div style={{padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
          {/* Logo + title */}
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
              {isTHCK?"🏭":"🔧"}
            </div>
            <div>
              <div style={{fontSize:14,fontWeight:800,letterSpacing:.2}}>Quản Lý Vật Tư BOM</div>
              <div style={{fontSize:10,opacity:.6}}>{isTHCK?"Nhà máy THCK":"Xưởng Hàn"}</div>
            </div>
          </div>
          {/* User + logout */}
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {msg&&<span style={{fontSize:11,color:"#6ee7b7",background:"rgba(0,0,0,0.2)",borderRadius:20,padding:"3px 10px"}}>{msg}</span>}
            <div style={{display:"flex",alignItems:"center",gap:7,background:"rgba(255,255,255,0.12)",borderRadius:20,padding:"5px 10px 5px 6px",cursor:"pointer"}}
              onClick={()=>{if(window.confirm("Đăng xuất?"))setUser(null);}}>
              <span style={{fontSize:16}}>{user.avatar}</span>
              <div>
                <div style={{fontSize:11,fontWeight:700,lineHeight:1.2}}>{user.ten}</div>
                <div style={{fontSize:9,opacity:.6,lineHeight:1.2}}>Đăng xuất 🚪</div>
              </div>
            </div>
          </div>
        </div>

        {/* Project bar */}
        <div style={{padding:"8px 16px",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          {/* Project select */}
          <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.1)",borderRadius:8,padding:"4px 6px 4px 10px",flex:"0 0 auto"}}>
            <span style={{fontSize:11,opacity:.7,whiteSpace:"nowrap"}}>Dự án:</span>
            <select value={pid} onChange={e=>sw(e.target.value)}
              style={{border:"none",background:"transparent",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",outline:"none",maxWidth:130}}>
              {projs.map(p=><option key={p.id} value={p.id} style={{background:"#1e3a5f"}}>{p.icon} {p.ten}</option>)}
            </select>
          </div>
          {/* Actions */}
          <button onClick={()=>setNewP(true)} style={{...btn,background:"rgba(255,255,255,0.15)",color:"#fff",border:"1px solid rgba(255,255,255,0.25)",padding:"5px 11px",fontSize:12}}>＋ Thêm</button>
          {projs.length>1&&<button onClick={()=>delProj(pid)} style={{...btn,background:"rgba(220,38,38,0.3)",color:"#fca5a5",border:"1px solid rgba(220,38,38,0.4)",padding:"5px 10px",fontSize:11}}>🗑</button>}
          <button onClick={editSoXe} style={{...btn,background:"rgba(251,191,36,0.15)",color:"#fbbf24",border:"1px solid rgba(251,191,36,0.3)",padding:"5px 11px",fontSize:12}}>🚌 {soXe} xe</button>
          {/* Stats */}
          <div style={{marginLeft:"auto",display:"flex",gap:6}}>
            {[[fmt(bom.length),"Mã VT","#fff"],[fmt(phList.length),"Phiếu","#fbbf24"],[fmt(ls.length),"GD","#6ee7b7"]].map(([v,l,c])=>(
              <div key={l} style={{textAlign:"center",background:"rgba(255,255,255,0.1)",padding:"4px 10px",borderRadius:8,minWidth:44}}>
                <div style={{fontWeight:800,fontSize:13,color:c,lineHeight:1}}>{v}</div>
                <div style={{opacity:.55,fontSize:9,marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Role strip */}
        <div style={{padding:"5px 16px 8px",display:"flex",alignItems:"center",gap:8}}>
          <span style={{background:isTHCK?"rgba(29,78,216,0.5)":"rgba(180,83,9,0.5)",border:`1px solid rgba(255,255,255,0.2)`,borderRadius:20,padding:"2px 12px",fontSize:10,fontWeight:700,color:isTHCK?"#bfdbfe":"#fed7aa",letterSpacing:.3}}>
            {isTHCK?"🏭 THCK":"🔧 XƯỞNG HÀN"}
          </span>
          <span style={{fontSize:10,opacity:.5}}>{isTHCK?"Soạn hàng · Lập phiếu giao vật tư":"Kiểm tra · Xác nhận · Quản lý BOM"}</span>
        </div>
        </div>{/* /zIndex:1 wrapper */}
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
                    <button onClick={()=>{if(!window.confirm(`Gửi ${soaned} mã đã soạn đến Xưởng Hàn?`))return;guiDon();}} disabled={soaned===0}
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
                            <div style={{fontWeight:700,fontSize:13,color:mauP,fontFamily:"monospace"}}>{v.ma}</div>
                            <div style={{fontSize:11,color:on?"#9ca3af":"#374151",textDecoration:on?"line-through":"none",marginTop:1}}>{v.ten}</div>
                            <div style={{fontSize:10,color:"#6b7280",marginTop:2,display:"flex",gap:8,flexWrap:"wrap"}}>
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
                  <button onClick={()=>{if(!window.confirm(`Gửi ${soaned} mã đã soạn?`))return;guiDon();}}
                    style={{...btn,background:"#fff",color:xong?"#16a34a":"#1d4ed8",padding:"10px 24px",fontSize:14,fontWeight:700,borderRadius:10}}>
                    📤 {xong?"Gửi Xưởng Hàn":"Gửi đơn ngay"}
                  </button>
                </div>
              )}
            </div>
          );
        })()}


        {/* ── DUYỆT ĐƠN HÀNG (XH) ── */}
        {tab==="duyet"&&isXH&&(()=>{
          // Lấy tất cả phiếu từ mọi dự án
          const allPh=Object.entries(phDB).flatMap(([projId,phs])=>(phs||[]).map(ph=>({...ph,projId})));
          const choXN=allPh.filter(ph=>ph.tt==="Chờ xác nhận");
          const daXN=allPh.filter(ph=>ph.tt==="Đã xác nhận");
          return(
            <div>
              <div style={{background:"linear-gradient(135deg,#431407,#b45309)",borderRadius:12,padding:"16px 20px",marginBottom:14,color:"#fff",boxShadow:"0 4px 16px rgba(0,0,0,0.15)"}}>
                <div style={{fontSize:15,fontWeight:700,marginBottom:4}}>✅ Duyệt Đơn Hàng — Xưởng Hàn</div>
                <div style={{fontSize:12,opacity:.8}}>Đơn từ Nhà máy THCK gửi · {choXN.length} chờ duyệt · {daXN.length} đã duyệt</div>
                <div style={{display:"flex",gap:10,marginTop:10,flexWrap:"wrap"}}>
                  {[["Chờ duyệt",choXN.length,"#fca5a5"],["Đã duyệt",daXN.length,"#6ee7b7"],["Tổng đơn",allPh.length,"#fff"]].map(([l,v,c])=>(
                    <div key={l} style={{textAlign:"center",background:"rgba(255,255,255,0.15)",borderRadius:8,padding:"6px 14px"}}>
                      <div style={{fontWeight:700,fontSize:18,color:c}}>{v}</div>
                      <div style={{fontSize:10,opacity:.8}}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {choXN.length===0&&daXN.length===0&&(
                <div style={{background:"#fff",borderRadius:10,padding:60,textAlign:"center",color:"#9ca3af",boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
                  <div style={{fontSize:48,marginBottom:12}}>📭</div>
                  <div style={{fontSize:14,fontWeight:600}}>Chưa có đơn hàng nào</div>
                  <div style={{fontSize:12,marginTop:4}}>Đơn hàng sẽ hiện ở đây khi Nhà máy THCK gửi</div>
                </div>
              )}

              {choXN.length>0&&(
                <div style={{marginBottom:16}}>
                  <div style={{fontWeight:700,fontSize:13,color:"#dc2626",marginBottom:8}}>⏳ Chờ duyệt ({choXN.length})</div>
                  {choXN.map(ph=>{
                    const projName=projs.find(p=>p.id===ph.projId)?.ten||ph.projId;
                    const daSoanItems=(ph.ct||[]).filter(c=>c.sl>0);
                    return(
                      <div key={ph.id} style={{background:"#fff",borderRadius:10,marginBottom:10,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",border:"1px solid #fde68a",overflow:"hidden"}}>
                        <div style={{padding:"12px 16px",background:"#fffbeb",borderBottom:"1px solid #fde68a",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                          <div>
                            <div style={{fontWeight:700,fontSize:14}}>📄 {ph.sp}</div>
                            <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>
                              🏭 {projName} · 📅 {ph.ngay} · 📦 {daSoanItems.length}/{ph.tong} mã đã soạn
                            </div>
                            {ph.gc&&<div style={{fontSize:11,color:"#92400e",marginTop:2}}>💬 {ph.gc}</div>}
                          </div>
                          <button onClick={()=>xacNhan(ph.id)} style={{...btn,background:"#16a34a",color:"#fff",padding:"8px 18px",fontSize:13,fontWeight:700}}>
                            ✓ Xác nhận duyệt
                          </button>
                        </div>
                        <div style={{overflowX:"auto"}}>
                          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                            <thead>
                              <tr style={{background:"#f8fafc",borderBottom:"1px solid #e5e7eb"}}>
                                {["STT","Mã vật tư","Tên vật tư","ĐVT","SL soạn","Trạng thái"].map(h=>(
                                  <th key={h} style={{padding:"7px 10px",textAlign:"left",fontWeight:700,color:"#374151",fontSize:11}}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {(ph.ct||[]).map((c,i)=>(
                                <tr key={c.id} style={{borderBottom:"1px solid #f1f5f9",background:c.sl>0?(i%2===0?"#f0fdf4":"#f7fef9"):(i%2===0?"#fff":"#fafafa")}}>
                                  <td style={{padding:"7px 10px",color:"#9ca3af",fontSize:11}}>{c.stt}</td>
                                  <td style={{padding:"7px 10px",fontWeight:700,color:"#b45309",fontFamily:"monospace",fontSize:11}}>{c.ma}</td>
                                  <td style={{padding:"7px 10px",fontSize:12,maxWidth:200}}>{c.ten}</td>
                                  <td style={{padding:"7px 10px",color:"#6b7280",textAlign:"center"}}>{c.dv}</td>
                                  <td style={{padding:"7px 10px",textAlign:"center",fontWeight:700,color:c.sl>0?"#065f46":"#9ca3af"}}>{c.sl>0?fmt(c.sl):"—"}</td>
                                  <td style={{padding:"7px 10px"}}>
                                    {(()=>{
                                      const vtBom=bom.find(b=>b.ma===c.ma);
                                      const slCan=(vtBom?.dm||0)*soXe;
                                      const thieu=c.sl>0&&slCan>0&&c.sl<slCan;
                                      if(!c.sl||c.sl===0)
                                        return<span style={{background:"#f1f5f9",color:"#9ca3af",borderRadius:10,padding:"2px 8px",fontSize:10}}>Chưa soạn</span>;
                                      if(thieu)
                                        return<span style={{background:"#fef3c7",color:"#92400e",borderRadius:10,padding:"2px 8px",fontSize:10,fontWeight:700}}>⚠️ VT chưa đồng bộ ({fmt(c.sl)}/{fmt(slCan)})</span>;
                                      return<span style={{background:"#d1fae5",color:"#065f46",borderRadius:10,padding:"2px 8px",fontSize:10,fontWeight:700}}>✓ Đã soạn</span>;
                                    })()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {daXN.length>0&&(
                <div>
                  <div style={{fontWeight:700,fontSize:13,color:"#16a34a",marginBottom:8}}>✅ Đã duyệt ({daXN.length})</div>
                  {daXN.map(ph=>{
                    const projName=projs.find(p=>p.id===ph.projId)?.ten||ph.projId;
                    return(
                      <div key={ph.id} style={{background:"#fff",borderRadius:10,marginBottom:8,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",border:"1px solid #bbf7d0",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                        <div>
                          <div style={{fontWeight:700,fontSize:13}}>📄 {ph.sp} <span style={{background:"#d1fae5",color:"#065f46",borderRadius:10,padding:"1px 8px",fontSize:10,fontWeight:700,marginLeft:6}}>✅ Đã duyệt</span></div>
                          <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>🏭 {projName} · 📅 {ph.ngay} · 📦 {ph.tong} mã</div>
                        </div>
                        <button onClick={()=>setViewPh(ph)} style={{...btn,background:"#eff6ff",color:"#1d4ed8",padding:"5px 12px",fontSize:11}}>Xem chi tiết</button>
                      </div>
                    );
                  })}
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
                      {f2.map((v,i)=>{
                        const isSel=selMa===v.ma;
                        return(
                        <tr key={v.ma} onClick={()=>setSelMa(s=>s===v.ma?null:v.ma)} style={{borderBottom:"1px solid #f1f5f9",background:isSel?"#fff7ed":v.done?"#f0fdf4":i%2===0?"#fff":"#f9fafb",cursor:"pointer",transition:"background .15s"}}>
                          <td style={{padding:"7px 10px",textAlign:"center",color:"#9ca3af",fontSize:11}}>{v.stt}</td>
                          <td style={{padding:"7px 10px",fontWeight:700,color:mauP,fontFamily:"monospace",fontSize:10,whiteSpace:"nowrap"}}>{v.ma}</td>
                          <td style={{padding:"7px 10px",maxWidth:200,fontSize:12}}><span title={v.ten}>{v.ten.length>40?v.ten.slice(0,40)+"…":v.ten}</span></td>
                          <td style={{padding:"7px 10px",color:"#6b7280",textAlign:"center"}}>{v.dv}</td>
                          <td style={{padding:"7px 10px",textAlign:"center",color:"#6b7280"}}>{fmt(v.dm)}</td>
                          <td style={{padding:"7px 10px",textAlign:"center",fontWeight:700}}>{fmt(v.cn)}</td>
                          <td style={{padding:"7px 10px",textAlign:"center",fontWeight:700,color:v.dn>0?"#065f46":"#9ca3af"}}>
                            {fmt(v.dn)}{v.vt>0&&<span style={{fontSize:9,color:"#b45309",display:"block"}}>+{fmt(v.vt)} vượt</span>}
                          </td>
                          <td style={{padding:"7px 10px",textAlign:"center",fontWeight:700,color:v.done?"#16a34a":isSel?"#dc2626":"#ea580c"}}>{v.done?"✅":fmt(v.ct)}</td>
                          <td style={{padding:"7px 10px",minWidth:100}}>
                            <div style={{display:"flex",alignItems:"center",gap:6}}>
                              <Prog p={v.p} done={v.done}/>
                              <span style={{fontSize:10,fontWeight:700,minWidth:32,color:v.done?"#16a34a":"#6b7280"}}>{v.p}%</span>
                            </div>
                          </td>
                        </tr>
                        );
                      })}
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
                    {[["Tổng mã",bom.length,"#c7d2fe"],["Đủ ✅",maDone,"#6ee7b7"],["Chưa soạn 📭",maChuaSoan,"#e2e8f0"],["Giao thiếu 📉",maGiaoThieu,"#fde68a"],["Phiếu",phList.length,"#a5f3fc"]].map(([l,v,c])=>(
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
                  {[["all","Tất cả"],["thieu",`⚠️ Còn thiếu (${bom.length-maDone})`],["chuasoan",`📭 Chưa soạn (${maChuaSoan})`],["giaothieu",`📉 Giao thiếu SL (${maGiaoThieu})`],["du",`✅ Đủ (${maDone})`]].map(([v,l])=>(
                    <button key={v} onClick={()=>setBcFlt(v)} style={{...btn,background:bcFlt===v?(v==="thieu"?"#dc2626":v==="du"?"#16a34a":"#4f46e5"):"#f3f4f6",color:bcFlt===v?"#fff":"#374151",padding:"5px 12px",fontSize:11}}>{l}</button>
                  ))}
                </div>
              </div>
              {Object.entries(nhomDM).map(([dm,items])=>{
                const fil=items.filter(v=>bcFlt==="all"||(bcFlt==="thieu"&&!v.done)||(bcFlt==="du"&&v.done)||(bcFlt==="chuasoan"&&v.chuaSoan)||(bcFlt==="giaothieu"&&v.giaoThieu));
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
                            {fil.map((v,ri)=>{
                              const isSel2=selMa===v.ma;
                              return(
                              <Fragment key={v.ma}>
                                <tr onClick={()=>setSelMa(s=>s===v.ma?null:v.ma)} style={{borderBottom:"1px solid #f1f5f9",background:isSel2?"#fff7ed":v.done?"#f0fdf4":ri%2===0?"#fff":"#fafafa",cursor:"pointer",transition:"background .15s"}}>
                                  <td style={{padding:"7px 10px",textAlign:"center",color:"#9ca3af",fontSize:11}}>{v.stt}</td>
                                  <td style={{padding:"7px 10px",fontWeight:700,color:mauP,fontFamily:"monospace",fontSize:10,whiteSpace:"nowrap"}}>{v.ma}</td>
                                  <td style={{padding:"7px 10px",maxWidth:180}}><span title={v.ten}>{v.ten.length>35?v.ten.slice(0,35)+"…":v.ten}</span></td>
                                  <td style={{padding:"7px 10px",color:"#6b7280",textAlign:"center"}}>{v.dv}</td>
                                  <td style={{padding:"7px 10px",textAlign:"center",color:"#6b7280"}}>{fmt(v.dm)}</td>
                                  <td style={{padding:"7px 10px",textAlign:"center",fontWeight:700}}>{fmt(v.cn)}</td>
                                  <td style={{padding:"7px 10px",textAlign:"center",fontWeight:700,color:v.dn>0?"#065f46":"#9ca3af"}}>{fmt(v.dn)}</td>
                                  <td style={{padding:"7px 10px",textAlign:"center",fontWeight:700,color:v.done?"#16a34a":isSel2?"#dc2626":"#ea580c"}}>
                                    {v.done?"✅":v.chuaSoan
                                      ?<span style={{background:"#f1f5f9",color:"#6b7280",borderRadius:8,padding:"1px 6px",fontSize:10,fontWeight:700}}>📭 Chưa soạn</span>
                                      :<span><span style={{color:isSel2?"#dc2626":"#ea580c"}}>{fmt(v.ct)}</span><br/><span style={{fontSize:9,color:"#f59e0b",fontWeight:600}}>📉 Giao thiếu</span></span>
                                    }
                                  </td>
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
                            );})}
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
