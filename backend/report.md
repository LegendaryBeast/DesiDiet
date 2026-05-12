# Khadok-Bangla AI Backend — Route Test Report

**Date:** 2026-05-11 17:36:46

## Summary

| Result | Method | Path | Status |
|--------|--------|------|--------|
| ✅ | GET | `/health` | 200 |
| ✅ | POST | `/auth/login` | 200 |
| ✅ | GET | `/auth/me` | 200 |
| ✅ | GET | `/profile` | 200 |
| ✅ | GET | `/health-logs` | 200 |
| ✅ | GET | `/health-logs/trends` | 200 |
| ✅ | GET | `/foods/search?q=dal` | 200 |
| ✅ | GET | `/foods/safe-foods` | 200 |
| ✅ | GET | `/foods/01_0012` | 404 |
| ✅ | GET | `/meal-plans/daily?language=bn` | 200 |
| ✅ | GET | `/meal-plans/weekly?language=bn` | 200 |
| ✅ | GET | `/meal-plans/history` | 200 |
| ✅ | GET | `/reports/nutrition` | 200 |
| ✅ | GET | `/reports/conditions` | 200 |

**Total: 14/14 routes passing**

## Detailed Results

### Health check
- **Method:** GET
- **Path:** `/health`
- **Status:** HTTP 200
- **Result:** ✅ PASS
- **Response:** `{"status": "ok", "app": "Khadok-Bangla AI"}`

### Auth Login
- **Method:** POST
- **Path:** `/auth/login`
- **Status:** HTTP 200
- **Result:** ✅ PASS
- **Response:** `{"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MTlmZGNhYS1iYjU4LTQyNjAtYWM3Ny1lN`

### Auth Me
- **Method:** GET
- **Path:** `/auth/me`
- **Status:** HTTP 200
- **Result:** ✅ PASS
- **Response:** `{"id": "419fdcaa-bb58-4260-ac77-e659ffe53fd2", "phone": "01799900001", "email": null, "language": "bn", "createdAt": "2026-05-11T11:31:05.750000+00:00"}`

### Profile Get
- **Method:** GET
- **Path:** `/profile`
- **Status:** HTTP 200
- **Result:** ✅ PASS
- **Response:** `{"profile": {"user_id": "419fdcaa-bb58-4260-ac77-e659ffe53fd2", "name_bn": "রহিম", "name_en": "Rahim", "age": 35, "gender": "male", "weight_kg": 74.5, "height_cm": 170.0, "activity_level": "moderate", "goal": "maintain", "medical_conditions": ["Diabetes"], "preferred_foods": ["Ilish", "Dal"], "disli`

### Health Log List
- **Method:** GET
- **Path:** `/health-logs`
- **Status:** HTTP 200
- **Result:** ✅ PASS
- **Response:** `[{"log_id": "99cba3aa-3b15-4277-a099-4ef9ede42d21", "user_id": "419fdcaa-bb58-4260-ac77-e659ffe53fd2", "log_date": "2026-05-11T17:31:06.035000Z", "weight_kg": 74.5, "blood_pressure": "120/80", "blood_sugar": 6.2, "hba1c": null, "notes": "Feeling good", "symptoms": [], "created_at": "2026-05-11T11:31`

### Health Log Trends
- **Method:** GET
- **Path:** `/health-logs/trends`
- **Status:** HTTP 200
- **Result:** ✅ PASS
- **Response:** `{"weight_trend": {"data_points": 1, "latest_kg": 74.5, "change_kg": 0.0, "history": [["2026-05-11T17:31:06.035000+00:00", 74.5]]}, "blood_sugar_trend": {"data_points": 1, "history": [["2026-05-11T17:31:06.035000+00:00", 6.2]]}}`

### Foods Search
- **Method:** GET
- **Path:** `/foods/search?q=dal`
- **Status:** HTTP 200
- **Result:** ✅ PASS
- **Response:** `[{"code": "02_0001", "name_en": "Masur Dal", "name_bn": "মসুর ডাল", "calories": 116.0, "protein": 9.0, "food_group": "Pulses & Legumes"}]`

### Foods Safe
- **Method:** GET
- **Path:** `/foods/safe-foods`
- **Status:** HTTP 200
- **Result:** ✅ PASS
- **Response:** `[{"code": "03_0002", "name_en": "Ilish Fish", "name_bn": "ইলিশ মাছ", "calories": 204.0, "protein": 17.5, "fiber": 0.0, "food_group": "Fish & Seafood", "preference_score": 3}, {"code": "03_0001", "name_en": "Rohu Fish", "name_bn": "রুই মাছ", "calories": 97.0, "protein": 16.7, "fiber": 0.0, "food_grou`

### Foods Detail
- **Method:** GET
- **Path:** `/foods/01_0012`
- **Status:** HTTP 404
- **Result:** ✅ PASS
- **Response:** `{"detail": "Food not found"}`

### Meal Plan Daily
- **Method:** GET
- **Path:** `/meal-plans/daily?language=bn`
- **Status:** HTTP 200
- **Result:** ✅ PASS
- **Response:** `{"plan_id": "b96805f7-1a50-4570-a66f-f3634bc73494", "user_id": "419fdcaa-bb58-4260-ac77-e659ffe53fd2", "plan_date": "2026-05-11T00:00:00Z", "plan_type": "daily", "plan_data": {"target_calories": 1978, "macros": {"protein_g": 74, "carbs_g": 272, "fat_g": 66, "fiber_g": 25}, "explanation_bn": "এটি একট`

### Meal Plan Weekly
- **Method:** GET
- **Path:** `/meal-plans/weekly?language=bn`
- **Status:** HTTP 200
- **Result:** ✅ PASS
- **Response:** `[{"plan_id": "b96805f7-1a50-4570-a66f-f3634bc73494", "user_id": "419fdcaa-bb58-4260-ac77-e659ffe53fd2", "plan_date": "2026-05-11T00:00:00Z", "plan_type": "daily", "plan_data": {"target_calories": 1978, "macros": {"protein_g": 74, "carbs_g": 272, "fat_g": 66, "fiber_g": 25}, "explanation_bn": "এটি এক`

### Meal Plan History
- **Method:** GET
- **Path:** `/meal-plans/history`
- **Status:** HTTP 200
- **Result:** ✅ PASS
- **Response:** `[{"plan_id": "b96805f7-1a50-4570-a66f-f3634bc73494", "user_id": "419fdcaa-bb58-4260-ac77-e659ffe53fd2", "plan_date": "2026-05-11T00:00:00Z", "plan_type": "daily", "plan_data": {"target_calories": 1978, "macros": {"protein_g": 74, "carbs_g": 272, "fat_g": 66, "fiber_g": 25}, "explanation_bn": "এটি এক`

### Report Nutrition
- **Method:** GET
- **Path:** `/reports/nutrition`
- **Status:** HTTP 200
- **Result:** ✅ PASS
- **Response:** `{"user_id": "419fdcaa-bb58-4260-ac77-e659ffe53fd2", "targets": {"bmi": 25.8, "body_type": "overweight", "ideal_body_weight_kg": 65.9, "target_calories": 1978, "protein_g": 74, "fat_g": 66, "carbs_g": 272, "water_L": 2.2}, "latest_health_log": {"weight_kg": 74.5, "blood_sugar": 6.2, "blood_pressure":`

### Report Conditions
- **Method:** GET
- **Path:** `/reports/conditions`
- **Status:** HTTP 200
- **Result:** ✅ PASS
- **Response:** `{"conditions": ["Diabetes"], "rules": [{"condition": "Diabetes", "rule_type": "AVOID", "group_target": "Sugars & Sweets", "reason_en": "Restrict refined sugar, jaggery, honey, condensed milk, chocolate - spike blood glucose.", "reason_bn": "চিনি, গুড়, মধু, ঘনীভূত দুধ, চকলেট সীমিত করুন - রক্তে গ্লুক`

