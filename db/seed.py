import logging
from sqlalchemy import select, func
from db.models import User, Lead, History, Admin
from db.sessions import AsyncSessionLocal
from db.enum import UserStatus
from services.token import get_password_hash

logger = logging.getLogger(__name__)


async def seed_database():
    """
    Ilova ishga tushganda bazani boshlang'ich va mock ma'lumotlar bilan to'ldiradi.
    Idempotent: agar ma'lumotlar avval kiritilgan bo'lsa, qayta qo'shmaydi.
    """
    async with AsyncSessionLocal() as session:
        try:
            # 1. ADMIN USER
            admin_user = await User.get(session, email="admin@crm.com")
            if not admin_user:
                admin_pw = await get_password_hash("admin123")
                admin_user = await User.create(
                    session,
                    full_name="Admin Foydalanuvchi",
                    email="admin@crm.com",
                    phone_number="998901234567",
                    password=admin_pw,
                    is_admin=True,
                )
                logger.info("Admin foydalanuvchi yaratildi: admin@crm.com / admin123")

            # 2. MANAGER USER (Oddiy xodim)
            manager_user = await User.get(session, email="menejer@crm.com")
            if not manager_user:
                manager_pw = await get_password_hash("menejer123")
                manager_user = await User.create(
                    session,
                    full_name="Jasur Rahimov",
                    email="menejer@crm.com",
                    phone_number="998909876543",
                    password=manager_pw,
                    is_admin=False,
                )
                logger.info("Menejer foydalanuvchi yaratildi: menejer@crm.com / menejer123")

            # 3. STARLETTE-ADMIN USER
            admin_panel_user = await Admin.get(session, username="admin")
            if not admin_panel_user:
                panel_pw = await get_password_hash("admin123")
                await Admin.create(
                    session,
                    username="admin",
                    password=panel_pw,
                )
                logger.info("Starlette-Admin foydalanuvchi yaratildi: username=admin / admin123")

            # 4. MOCK LEADS & HISTORIES
            leads_count_res = await session.execute(select(func.count(Lead.id)))
            leads_count = leads_count_res.scalar() or 0

            if leads_count == 0:
                mock_leads = [
                    {
                        "name": "Alisher Usmonov",
                        "phone_number": "998911112233",
                        "email": "alisher@mail.uz",
                        "source": "Instagram",
                        "status": UserStatus.NEW.value,
                        "note": "Web-sayt va CRM integratsiyasi bo'yicha qiziqmoqda.",
                        "history": ["Lead tizimga qo'shildi"],
                    },
                    {
                        "name": "Madina Karimova",
                        "phone_number": "998934445566",
                        "email": "madina@company.uz",
                        "source": "Telegram",
                        "status": UserStatus.CONTACTED.value,
                        "note": "Taqdimot yuborildi, dushanba kuni qayta qo'ng'iroq qilish kerak.",
                        "history": [
                            "Lead tizimga qo'shildi",
                            "Mijoz bilan telefon orqali gaplashildi, status: Contacted",
                        ],
                    },
                    {
                        "name": "Bekzod Toirov",
                        "phone_number": "998977778899",
                        "email": "bekzod@itpark.uz",
                        "source": "Veb-sayt",
                        "status": UserStatus.QUALIFIED.value,
                        "note": "Byudjet va muddatlar kelishildi ($3,000), shartnoma kutilmoqda.",
                        "history": [
                            "Lead tizimga qo'shildi",
                            "Texnik talablar aniqlandi, status: Qualified",
                        ],
                    },
                    {
                        "name": "Nodira Zokirova",
                        "phone_number": "998990001122",
                        "email": "nodira@gmail.com",
                        "source": "Tavsiya",
                        "status": UserStatus.WON.value,
                        "note": "To'lov to'liq amalga oshirildi, loyiha muvaffaqiyatli topshirildi!",
                        "history": [
                            "Lead tizimga qo'shildi",
                            "Shartnoma imzolandi",
                            "To'lov qabul qilindi, status: Won",
                        ],
                    },
                    {
                        "name": "Sherzod Rustamov",
                        "phone_number": "998943332211",
                        "email": "sherzod@logistics.uz",
                        "source": "Ko'cha reklamasi",
                        "status": UserStatus.LOST.value,
                        "note": "Byudjet yetarli emasligi sababli rad etildi.",
                        "history": [
                            "Lead tizimga qo'shildi",
                            "Mijoz taklif qilingan narxga rozi bo'lmadi, status: Lost",
                        ],
                    },
                    {
                        "name": "Dilnoza Ahmedova",
                        "phone_number": "998908889900",
                        "email": "dilnoza@fintech.uz",
                        "source": "Facebook",
                        "status": UserStatus.NEW.value,
                        "note": "CRM mobil ilovasi ishlab chiqish narxini so'ramoqda.",
                        "history": ["Lead tizimga qo'shildi"],
                    },
                    {
                        "name": "Javohir Ergashev",
                        "phone_number": "998912223344",
                        "email": "javohir@startup.io",
                        "source": "Telegram kanali",
                        "status": UserStatus.CONTACTED.value,
                        "note": "Telegram-bot va to'lov tizimlarini ulash bo'yicha so'rov qoldirdi.",
                        "history": ["Lead tizimga qo'shildi", "Birinchi aloqa o'rnatildi"],
                    },
                    {
                        "name": "Ziyoda Qodirova",
                        "phone_number": "998956667788",
                        "email": "ziyoda@edu.uz",
                        "source": "Tadbir (Networking)",
                        "status": UserStatus.QUALIFIED.value,
                        "note": "O'quv markazi uchun avtomatlashtirilgan CRM talab etilmoqda.",
                        "history": ["Lead tadbirdan qo'shildi", "Talablar muhokama qilindi"],
                    }
                ]

                creator_id = admin_user.id if admin_user else None

                for lead_item in mock_leads:
                    history_items = lead_item.pop("history")
                    lead_obj = await Lead.create(session, creator_id=creator_id, **lead_item)
                    for h_detail in history_items:
                        await History.create(
                            session,
                            user_id=creator_id,
                            lead_id=lead_obj.id,
                            detail=h_detail,
                        )

                logger.info(f"{len(mock_leads)} ta mock lead muvaffaqiyatli kiritildi.")

            await session.commit()
        except Exception as e:
            await session.rollback()
            logger.error(f"Ma'lumotlar bazasini seed qilishda xatolik: {e}")
