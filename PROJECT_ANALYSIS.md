# MiniCRM Loyihasi Tahlili (Yangilangan Versiya)

Ushbu hujjat **MiniCRM** loyihasining so'nggi kiritilgan o'zgarishlaridan keyingi to'liq tahlili, yangi arxitekturaviy
tuzilishi, komponentlari, tekshiruv natijalari va aniqlangan muhim masalalarni o'z ichiga oladi.

---

## 1. Loyihaning hozirgi holati va muvaffaqiyatli o'zgarishlar

Foydalanuvchi tomonidan kiritilgan oxirgi o'zgarishlar loyiha sifatini sezilarli darajada oshirdi:

1. **`User` va `Lead` modellari to'liq ajratildi**:
    - Endi `User` tizim foydalanuvchisi (xodim, menejer, admin) hisoblanadi.
    - `Lead` alohida model sifatida shakllantirildi (`name`, `source`, `phone_number`, `email`, `note`, `status`,
      `creator_id`, `created_at`, `updated_at`).
2. **`History` (Audit log) modeli joriy qilindi**:
    - Har bir lead yaratilganda yoki tahrirlanganda qaysi xodim tomonidan qaysi maydonlar o'zgartirilganligi `History`
      jadvaliga avtomatik yozilmoqda.
3. **Validatsiya va Schemalar tozalandi**:
    - `schemas/base.py` dagi `return ValueError` xatosi tuzatildi (`raise ValueError`).
    - `LeadRequestSchema`, `LeadPatchRequestSchema`, `HistoryResponseSchema` sxemalari yaratildi.
4. **Filtrlash va Saralash**:
    - `LeadFilter` ga `status` (UserStatus) va `sorted_by` qo'shildi.
5. **Alembic migratsiyalari**:
    - Yangi jadvallar (`leads`, `histories`) uchun toza migratsiya fayli yaratildi va bazaga muvaffaqiyatli qo'llandi.

---

## 2. API Endpointlar xaritasi

| Metod   | Endpoint                           | Vazifasi                                           | Ruxsat / Auth         |               Holati                |
|:--------|:-----------------------------------|:---------------------------------------------------|:----------------------|:-----------------------------------:|
| `POST`  | `/auth/user/register`              | Yangi xodim ro'yxatdan o'tkazish                   | Ochiq                 |             Ishlayapti              |
| `POST`  | `/auth/login`                      | Tizimga kirish (email/telefon + parol)             | Ochiq                 | **Bug bor** (quyida tushuntirilgan) |
| `POST`  | `/auth/refresh`                    | Yangi JWT token juftligini olish                   | Ochiq                 |             Ishlayapti              |
| `GET`   | `/auth/users/me`                   | Joriy profil ma'lumotlarini olish                  | Bearer Auth           |             Ishlayapti              |
| `GET`   | `/controller/lead/list/`           | Lidlar ro'yxati (search, status, sort, pagination) | Bearer Auth           |             Ishlayapti              |
| `GET`   | `/controller/get/lead/{pk}/`       | Bitta lid ma'lumotini olish                        | Bearer Auth           |             Ishlayapti              |
| `POST`  | `/controller/create/lead/`         | Yangi lid yaratish                                 | Bearer Auth (+ Admin) |     **Permission ishlamayapti**     |
| `PATCH` | `/controller/update/lead/{pk}/`    | Lid ma'lumotlari yoki statusini tahrirlash         | Bearer Auth (+ Admin) |     **Permission ishlamayapti**     |
| `GET`   | `/controller/actions/history/{pk}` | Lid bo'yicha harakatlar tarixi                     | Bearer Auth           |             Ishlayapti              |

---

### 3. Biznes mantiq: Kimlar lead yaratishi mumkin?

- Hozirgi kodda `create_lead` va `update_lead` faqat admin uchun cheklanmoqda (`PermissionChecker`).
- CRM tizimlarida odatda **oddiy xodimlar/menejerlar ham** yangi lead yarata olishi va uning statusini o'zgartirishi
  kerak bo'ladi. Faqatgina o'chirish (`DELETE`) yoki tizim sozlamalari adminga cheklanadi. Buni biznes talablaringizga
  qarab aniqlashtirib olish tavsiya etiladi.

---

### 4. CRUD dagi to'liqlik: `DELETE` endpointi

- Vazifada to'liq CRUD so'ralgan. Hozirda:
    - Create: `POST /controller/create/lead/`
    - Read: `GET /controller/lead/list/` va `GET /controller/get/lead/{pk}/`
    - Update: `PATCH /controller/update/lead/{pk}/`
    - Delete: `DELETE /controller/delete/lead/{pk}/` hali yozilmagan.

---

### 5. `apps/test.py` dagi testlar

- `pytest` ishga tushirilganda 0 ta test topilmoqda, chunki `test_` prefiksi bilan boshlanuvchi haqiqiy test
  funksiyalari mavjud emas.
- `apps/test.py` dagi `login_user` funksiyasida `/login/token` endpointi chaqirilgan, aslida u `/auth/login`.

---

## 4. UI integratsiyasiga tayyorgarlik (Frontend Ready Check)

Backend API deyarli to'liq tayyor:

1. `GET /controller/lead/list/?search=...&status=...&limit=...&offset=...` — UI dagi asosiy jadval (table), qidiruv
   paneli va status filtrlarini chizish uchun qulay.
2. `GET /controller/actions/history/{pk}` — har bir lead uchun alohida modal/drawer ochib, uning o'zgarishlar tarixini
   chiroyli ko'rsatish mumkin.
3. `PATCH /controller/update/lead/{pk}/` — lead statusini o'zgartirish (masalan, Kanban doskasida drag-and-drop yoki
   dropdown orqali) va tahrirlash uchun qulay.
