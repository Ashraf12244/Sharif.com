// === Global Variables ===
const ADMIN_PASSWORD = '@122@44@good';
const ADMIN_EMAIL = 'ashraf97941@gmail.com';
const PRODUCTS_API = 'https://api.steinhq.com/v1/storages/68a013e9c088333365cdea1f';
const ORDERS_API = 'https://api.steinhq.com/v1/storages/68a00c82c088333365cde7e5';
const CUSTOMERS_API = 'https://api.steinhq.com/v1/storages/68a010b6c088333365cde940';
const DELIVERY_API = 'https://api.steinhq.com/v1/storages/68a016fcc088333365cdeaae';
const SELLERS_API = 'https://sheetdb.io/api/v1/cjv68epktfgvh';

let isAdmin = localStorage.getItem('isAdmin') === 'true';
let currentLanguage = localStorage.getItem('language') || 'en';
let products = JSON.parse(localStorage.getItem('products')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let settings = JSON.parse(localStorage.getItem('settings')) || { storeName: 'Sharif.com', currency: '₹', notice: '' };
let addresses = JSON.parse(localStorage.getItem('addresses')) || [];
let pendingSellers = JSON.parse(localStorage.getItem('pendingSellers')) || [];
let approvedSellers = JSON.parse(localStorage.getItem('approvedSellers')) || [];
let customers = JSON.parse(localStorage.getItem('customers')) || [];
let wishList = JSON.parse(localStorage.getItem('wishList')) || [];
let currentAction = '';

// === Initialization ===
document.addEventListener('DOMContentLoaded', async () => {
    updateStoreName();
    setupLanguageButtons();
    setupImagePreview();
    await loadProductsFromAPI();
    renderProducts();
    renderAdminProducts();
    renderPendingSellers();
    renderCart();
    renderWishList();
    setupSearchAndFilter();
    if (!isAdmin) document.getElementById('pageSettings').style.display = 'none';
    updateLanguage();
});

// === API Functions ===
async function loadProductsFromAPI() {
    try {
        const response = await fetch(PRODUCTS_API);
        const data = await response.json();
        if (data && data.length > 0) {
            products = data.map(item => ({
                id: item.id || Date.now(),
                title: item.title || '',
                description: item.description || '',
                price: parseFloat(item.price) || 0,
                image: item.image || '',
                brand: item.brand || '',
                seller: item.seller || 'admin',
                reviews: []
            }));
            localStorage.setItem('products', JSON.stringify(products));
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

async function saveOrderToAPI(orderData) {
    try {
        const response = await fetch(ORDERS_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error saving order:', error);
        return null;
    }
}

async function saveCustomerToAPI(customerData) {
    try {
        const response = await fetch(CUSTOMERS_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(customerData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error saving customer:', error);
        return null;
    }
}

async function saveSellerToAPI(sellerData) {
    try {
        const response = await fetch(SELLERS_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sellerData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error saving seller:', error);
        return null;
    }
}

// === Language Handling ===
function setupLanguageButtons() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLanguage = btn.dataset.lang;
            localStorage.setItem('language', currentLanguage);
            document.body.dir = currentLanguage === 'ur' ? 'rtl' : 'ltr';
            updateLanguage();
        });
    });
    document.querySelector(`.lang-btn[data-lang="${currentLanguage}"]`).classList.add('active');
}

function getTranslatedMessage(key) {
    const translations = {
        'Ecommerce': { en: 'Ecommerce', ur: 'ای کامرس', mm: 'အီးကုန်သွယ်ရေး' },
        'Our Products': { en: 'Our Products', ur: 'ہماری مصنوعات', mm: 'ကျွန်ုပ်တို့၏ထုတ်ကုန်များ' },
        'No products available.': { en: 'No products available.', ur: 'کوئی پروڈکٹس دستیاب نہیں ہیں۔', mm: 'ထုတ်ကုန်များမရရှိနိုင်ပါ။' },
        'Settings saved successfully!': { en: 'Settings saved successfully!', ur: 'ترتیبات کامیابی سے محفوظ ہو گئیں!', mm: 'ဆက်တင်များ အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ။' },
        'Are you sure you want to reset settings?': { en: 'Are you sure you want to reset settings?', ur: 'کیا آپ واقعی ترتیبات کو ری سیٹ کرنا چاہتے ہیں؟', mm: 'ဆက်တင်များကို ပြန်လည်သတ်မှတ်ရန် သေချာပါသလား။' },
        'Settings reset!': { en: 'Settings reset!', ur: 'ترتیبات ری سیٹ ہو گئیں!', mm: 'ဆက်တင်များ ပြန်လည်သတ်မှတ်ပြီးပါပြီ။' },
        'Please fill all required fields and enter a valid price or image': { en: 'Please fill all required fields and enter a valid price or image', ur: 'براہ کرم تمام مطلوبہ فیلڈز پُر کریں اور درست قیمت یا تصویر درج کریں۔', mm: 'ကျေးဇူးပြု၍ လိုအပ်သောအကွက်များအားလုံးဖြည့်ပြီး မှန်ကန်သောစျေးနှုန်း သို့မဟုတ် ပုံထည့်ပါ။' },
        'Product added successfully!': { en: 'Product added successfully!', ur: 'پروڈکٹ کامیابی سے شامل ہو گئی!', mm: 'ထုတ်ကုန်ကို အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ။' },
        'Are you sure you want to delete this product?': { en: 'Are you sure you want to delete this product?', ur: 'کیا آپ واقعی اس پروڈکٹ کو ڈیلیٹ کرنا چاہتے ہیں؟', mm: 'ဤထုတ်ကုန်ကို ဖျက်ရန် သေချာပါသလား။' },
        'Product deleted successfully!': { en: 'Product deleted successfully!', ur: 'پروڈکٹ کامیابی سے ڈیلیٹ ہو گئی!', mm: 'ထုတ်ကုန်ကို အောင်မြင်စွာ ဖျက်လိုက်ပါပြီ။' },
        'Product added to cart!': { en: 'Product added to cart!', ur: 'پروڈکٹ کارٹ میں شامل ہو گئی!', mm: 'ထုတ်ကုန်ကို စျေးခြင်းတောင်းထဲသို့ ထည့်လိုက်ပြီ။' },
        'Are you sure you want to clear the cart?': { en: 'Are you sure you want to clear the cart?', ur: 'کیا آپ واقعی کارٹ کو خالی کرنا چاہتے ہیں؟', mm: 'စျေးခြင်းတောင်းကို ဖျက်ရန် သေချာပါသလား။' },
        'Order placed successfully! We will contact you soon.': { en: 'Order placed successfully! We will contact you soon.', ur: 'آرڈر کامیابی سے جمع کرایا گیا! ہم جلد ہی آپ سے رابطہ کریں گے۔', mm: 'အော်ဒါအောင်မြင်စွာ တင်ပြီးပါပြီ! မကြာမီသင့်ကို ဆက်သွယ်ပါမည်။' },
        'Order placed but email failed': { en: 'Order placed but email failed', ur: 'آرڈر جمع ہو گیا لیکن ای میل نہیں بھیجی جا سکی', mm: 'အော်ဒါတင်ပြီးသော်လည်း အီးမေးလ်မပို့နိုင်' },
        'Seller account request submitted! Wait for admin approval.': { en: 'Seller account request submitted! Wait for admin approval.', ur: 'سیلر اکاؤنٹ کی درخواست کامیابی سے جمع کرائی گئی! انتظامیہ کی منظوری کے لیے انتظار کریں۔', mm: 'ရောင်းချသူအကောင့်တောင်းဆိုမှု အောင်မြင်စွာ တင်ပြီးပါပြီ! အုပ်ချုပ်ရေးမှူးမှ အတည်ပြုရန် စောင့်ပါ။' },
        'Seller account approved and email sent!': { en: 'Seller account approved and email sent!', ur: 'سیلر اکاؤنٹ منظور کر لیا گیا اور ای میل بھیج دی گئی!', mm: 'ရောင်းချသူအကောင့် အတည်ပြုပြီး အီးမေးလ်ပို့ပြီးပါပြီ!' },
        'Seller account rejected and email sent!': { en: 'Seller account rejected and email sent!', ur: 'سیلر اکاؤنٹ مسترد کر دیا گیا اور ای میل بھیج دی گئی!', mm: 'ရောင်းချသူအကောင့် ငြင်းပယ်ပြီး အီးမေးလ်ပို့ပြီးပါပြီ!' },
        'Email already registered!': { en: 'Email already registered!', ur: 'یہ ای میل پہلے سے رجسٹرڈ ہے!', mm: 'ဤအီးမေးလ်သည် မှတ်ပုံတင်ပြီးဖြစ်သည်!' },
        'Account created successfully! Email sent.': { en: 'Account created successfully! Email sent.', ur: 'اکاؤنٹ کامیابی سے بن گیا! ای میل بھیج دی گئی۔', mm: 'အကောင့်အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ! အီးမေးလ်ပို့ပြီးပါပြီ။' },
        'Invalid email format': { en: 'Invalid email format', ur: 'غلط ای میل فارمیٹ', mm: 'မမှန်ကန်သော အီးမေးလ်ပုံစံ' },
        'Invalid phone number': { en: 'Invalid phone number', ur: 'غلط فون نمبر', mm: 'မမှန်ကန်သော ဖုန်းနံပါတ်' },
        'Product added to wishlist!': { en: 'Product added to wishlist!', ur: 'پروڈکٹ وش لسٹ میں شامل ہو گئی!', mm: 'ထုတ်ကုန်ကို ဆန္ဒ�ာရင်းသို့ ထည့်လိုက်ပြီ!' },
        'Product already in wishlist!': { en: 'Product already in wishlist!', ur: 'پروڈکٹ پہلے سے وش لسٹ میں ہے!', mm: 'ထုတ်ကုန်သည် ဆန္ဒစာရင်းတွင် ရှိပြီးဖြစ်သည်!' },
        'Review submitted successfully!': { en: 'Review submitted successfully!', ur: 'جائزہ کامیابی سے جمع ہو گیا!', mm: 'သုံးသပ်ချက်ကို အောင်မြင်စွာ ပို့ပြီးပါပြီ။' },
        'Please fill all review fields': { en: 'Please fill all review fields', ur: 'براہ کرم جائزے کے تمام فیلڈز پُر کریں۔', mm: 'ကျေးဇူးပြု၍ သုံးသပ်ချက်အကွက်များအားလုံးဖြည့်ပါ။' },
        'Address saved successfully!': { en: 'Address saved successfully!', ur: 'پتہ کامیابی سے محفوظ ہو گیا!', mm: 'လိပ်စာကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ။' },
        'Please fill all required fields': { en: 'Please fill all required fields', ur: 'براہ کرم تمام مطلوبہ فیلڈز پُر کریں۔', mm: 'ကျေးဇူးပြု၍ လိုအပ်သောအကွက်များအားလုံးဖြည့်ပါ။' },
        'Order placed but email failed': { en: 'Order placed but email failed', ur: 'آرڈر جمع ہو گیا لیکن ای میل نہیں بھیجی جا سکی', mm: 'အော်ဒါတင်ပြီးသော်လည်း အီးမေးလ်မပို့နိုင်' },
        'Request submitted but email failed': { en: 'Request submitted but email failed', ur: 'درخواست جمع ہو گئی لیکن ای میل نہیں بھیجی جا سکی', mm: 'တောင်းဆိုမှု တင်ပြီးသော်လည်း အီးမေးလ်မပို့နိုင်' },
        'Account created but email failed': { en: 'Account created but email failed', ur: 'اکاؤنٹ بن گیا لیکن ای میل نہیں بھیجی جا سکی', mm: 'အကောင့်ဖန်တီးပြီးသော်လည်း အီးမေးလ်မပို့နိုင်' },
        'Recommended for You': { en: 'Recommended for You', ur: 'آپ کے لیے تجویز کردہ', mm: 'သင့်အတွက် အကြံပြုထားသော' },
        'Your Name': { en: 'Your Name', ur: 'آپ کا نام', mm: 'သင့်နာမည်' },
        'Your Review': { en: 'Your Review', ur: 'آپ کا جائزہ', mm: 'သင့်သုံးသပ်ချက်' },
        'Rating': { en: 'Rating', ur: 'ریٹنگ', mm: 'အဆင့်သတ်မှတ်ချက်' },
        'Submit Review': { en: 'Submit Review', ur: 'جائزہ جمع کریں', mm: 'သုံးသပ်ချက်တင်သွင်းရန်' },
        'Wishlist': { en: 'Wishlist', ur: 'وش لسٹ', mm: 'ဆန္ဒစာရင်း' },
        'Add to Wishlist': { en: 'Add to Wishlist', ur: 'وش لسٹ میں شامل کریں', mm: 'ဆန္ဒစာရင်းသို့ထည့်ပါ' },
        'Total': { en: 'Total', ur: 'کل', mm: 'စုစုပေါင်း' },
        'Place Order': { en: 'Place Order', ur: 'آرڈر دیں', mm: 'အော်ဒါတင်ပါ' },
        'Buy Now': { en: 'Buy Now', ur: 'ابھی خریدیں', mm: 'ယခုဝယ်ပါ' },
        'Add to Cart': { en: 'Add to Cart', ur: 'کارٹ میں شامل کریں', mm: 'စျေးခြင်းတောင်းသို့ထည့်ပါ' },
        'Seller': { en: 'Seller', ur: 'بیچنے والا', mm: 'ရောင်းချသူ' },
        'Store Settings': { en: 'Store Settings', ur: 'اسٹور ترتیبات', mm: 'ဆိုင်ဆက်တင်များ' },
        'Product Management': { en: 'Product Management', ur: 'پروڈکٹ مینجمنٹ', mm: 'ထုတ်ကုန်စီမံခန့်ခွဲမှု' },
        'Current Products': { en: 'Current Products', ur: 'موجودہ مصنوعات', mm: 'လက်ရှိထုတ်ကုန်များ' },
        'Address Book': { en: 'Address Book', ur: 'ایڈریس بک', mm: 'လိပ်စာစာအုပ်' },
        'Create Seller Account': { en: 'Create Seller Account', ur: 'سیلر اکاؤنٹ بنائیں', mm: 'ရောင်းချသူအကောင့်ဖန်တီးပါ' },
        'Pending Seller Accounts': { en: 'Pending Seller Accounts', ur: 'زیر التواء سیلر اکاؤنٹس', mm: 'ဆိုင်းငံ့ထားသော ရောင်းချသူအကောင့်များ' },
        'Create Customer Account': { en: 'Create Customer Account', ur: 'کسٹمر اکاؤنٹ بنائیں', mm: 'ဖောက်သည်အကောင့်ဖန်တီးပါ' },
        'Your Cart': { en: 'Your Cart', ur: 'آپ کی کارٹ', mm: 'သင့်စျေးခြင်းတောင်း' },
        'Clear Cart': { en: 'Clear Cart', ur: 'کارٹ صاف کریں', mm: 'စျေးခြင်းတောင်းရှင်းလင်းပါ' },
        'Order Now': { en: 'Order Now', ur: 'ابھی آرڈر کریں', mm: 'ယခုမှာယူပါ' },
        'Order Details': { en: 'Order Details', ur: 'آرڈر کی تفصیلات', mm: 'အော်ဒါအသေးစိတ်' },
        'Name': { en: 'Name', ur: 'نام', mm: 'နာမည်' },
        'Email': { en: 'Email', ur: 'ای میل', mm: 'အီးမေးလ်' },
        'Phone': { en: 'Phone', ur: 'فون', mm: 'ဖုန်း' },
        'Address': { en: 'Address', ur: 'پتہ', mm: 'လိပ်စာ' },
        'Order Summary': { en: 'Order Summary', ur: 'آرڈر کا خلاصہ', mm: 'အော်ဒါအကျဉ်းချုပ်' },
        'Admin Password Required': { en: 'Admin Password Required', ur: 'ایڈمن پاس ورڈ درکار ہے', mm: 'အက်ဒမင်စကားဝှက်လိုအပ်သည်' },
        'Enter password': { en: 'Enter password', ur: 'پاس ورڈ درج کریں', mm: 'စကားဝှက်ထည့်ပါ' },
        'Verify': { en: 'Verify', ur: 'تصدیق کریں', mm: 'အတည်ပြုပါ' },
        'Cancel': { en: 'Cancel', ur: 'منسوخ کریں', mm: 'ပယ်ဖျက်ပါ' },
        'Wrong password!': { en: 'Wrong password!', ur: 'غلط پاس ورڈ!', mm: 'စကားဝှက်မမှန်ကန်ပါ!' },
        'Add Product': { en: 'Add Product', ur: 'پروڈکٹ شامل کریں', mm: 'ထုတ်ကုန်ထည့်ပါ' },
        'Delete': { en: 'Delete', ur: 'حذف کریں', mm: 'ဖျက်မည်' },
        'Approve': { en: 'Approve', ur: 'منظور کریں', mm: 'အတည်ပြုပါ' },
        'Reject': { en: 'Reject', ur: 'مسترد کریں', mm: 'ငြင်းပယ်ပါ' },
        'Save Address': { en: 'Save Address', ur: 'پتہ محفوظ کریں', mm: 'လိပ်စာသိမ်းဆည်းပါ' },
        'Reset': { en: 'Reset', ur: 'ری سیٹ', mm: 'ပြန်လည်သတ်မှတ်ပါ' },
        'Create Account': { en: 'Create Account', ur: 'اکاؤنٹ بنائیں', mm: 'အကောင့်ဖန်တီးပါ' },
        'Home': { en: 'Home', ur: 'ہوم', mm: 'ပင်မစာမျက်နှာ' },
        'Settings': { en: 'Settings', ur: 'ترتیبات', mm: 'ဆက်တင်များ' },
    };
    return translations[key]?.[currentLanguage] || key;
}

function updateLanguage() {
    document.querySelectorAll('[data-en], [data-ur], [data-mm]').forEach(el => {
        const text = el.dataset[currentLanguage] || el.dataset.en;
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = text;
        } else {
            el.textContent = text;
        }
    });
    document.title = `${settings.storeName} — ${getTranslatedMessage('Ecommerce')}`;
    renderProducts();
    renderAdminProducts();
    renderPendingSellers();
    renderCart();
    renderWishList();
}

// === Store Settings ===
function saveStoreSettings() {
    settings.storeName = document.getElementById('setStoreName').value.trim() || 'Sharif.com';
    settings.currency = document.getElementById('setCurrency').value.trim() || '₹';
    settings.notice = document.getElementById('setNotice').value.trim();
    localStorage.setItem('settings', JSON.stringify(settings));
    updateStoreName();
    alert(getTranslatedMessage('Settings saved successfully!'));
}

function resetStoreSettings() {
    if (confirm(getTranslatedMessage('Are you sure you want to reset settings?'))) {
        settings = { storeName: 'Sharif.com', currency: '₹', notice: '' };
        localStorage.setItem('settings', JSON.stringify(settings));
        document.getElementById('setStoreName').value = settings.storeName;
        document.getElementById('setCurrency').value = settings.currency;
        document.getElementById('setNotice').value = '';
        updateStoreName();
        alert(getTranslatedMessage('Settings reset!'));
    }
}

function updateStoreName() {
    document.getElementById('storeName').textContent = settings.storeName;
    document.title = `${settings.storeName} — ${getTranslatedMessage('Ecommerce')}`;
}

// === Product Management ===
function setupImagePreview() {
    document.getElementById('imageInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function() {
                document.getElementById('imagePreview').src = reader.result;
                document.getElementById('imagePreview').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
}

function addProduct() {
    const title = document.getElementById('adminTitle').value.trim();
    const brand = document.getElementById('adminBrand').value.trim();
    const description = document.getElementById('adminDescription').value.trim();
    const price = parseFloat(document.getElementById('adminPrice').value);
    const imageInput = document.getElementById('imageInput').files[0];

    if (!title || !brand || !description || isNaN(price) || price <= 0 || !imageInput) {
        alert(getTranslatedMessage('Please fill all required fields and enter a valid price or image'));
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        const newProduct = {
            id: Date.now(),
            title: `${brand} ${title}`,
            description,
            price,
            image: reader.result,
            seller: 'admin',
            reviews: []
        };
        products.push(newProduct);
        localStorage.setItem('products', JSON.stringify(products));
        renderProducts();
        renderAdminProducts();
        resetProductForm();
        alert(getTranslatedMessage('Product added successfully!'));
    };
    reader.readAsDataURL(imageInput);
}

function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const filter = document.getElementById('filterSelect')?.value || 'all';

    let filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm)
    );

    if (filter === 'priceLow') filteredProducts.sort((a, b) => a.price - b.price);
    else if (filter === 'priceHigh') filteredProducts.sort((a, b) => b.price - a.price);

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `<p>${getTranslatedMessage('No products available.')}</p>`;
        return;
    }

    filteredProducts.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <div class="title">${product.title}</div>
            <div class="description">${product.description}</div>
            <div class="price">${settings.currency}${product.price.toLocaleString()}</div>
            <div>${getTranslatedMessage('Seller')}: ${product.seller}</div>
            <div class="product-actions">
                <button class="btn" onclick="addToCart(${product.id})">${getTranslatedMessage('Add to Cart')}</button>
                <button class="btn success" onclick="showOrderForm(${product.id})">${getTranslatedMessage('Buy Now')}</button>
                <button class="btn ghost" onclick="addToWishList(${product.id})">${getTranslatedMessage('Add to Wishlist')}</button>
            </div>
            <div class="review-section">
                <h4>${getTranslatedMessage('Reviews')}</h4>
                ${product.reviews.map(r => `
                    <div class="review">
                        <strong>${r.customer}</strong>: ${r.comment} (${r.rating}/5)
                    </div>
                `).join('')}
                <form onsubmit="addReview(event, ${product.id})" class="review-form">
                    <input type="text" placeholder="${getTranslatedMessage('Your Name')}" required>
                    <textarea placeholder="${getTranslatedMessage('Your Review')}" required></textarea>
                    <select required>
                        <option value="">${getTranslatedMessage('Rating')}</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                    <button class="btn">${getTranslatedMessage('Submit Review')}</button>
                </form>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

function renderAdminProducts() {
    const adminProductList = document.getElementById('adminProductList');
    adminProductList.innerHTML = '';
    products.filter(p => p.seller === 'admin').forEach((product) => {
        const productCard = document.createElement('div');
        productCard.className = 'card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <div class="title">${product.title}</div>
            <div class="description">${product.description}</div>
            <div class="price">${settings.currency}${product.price.toLocaleString()}</div>
            <div class="product-actions">
                <button class="btn danger" onclick="deleteProduct(${product.id})">${getTranslatedMessage('Delete')}</button>
            </div>
        `;
        adminProductList.appendChild(productCard);
    });
}

function deleteProduct(productId) {
    if (confirm(getTranslatedMessage('Are you sure you want to delete this product?'))) {
        products = products.filter(p => p.id !== productId);
        localStorage.setItem('products', JSON.stringify(products));
        renderProducts();
        renderAdminProducts();
        alert(getTranslatedMessage('Product deleted successfully!'));
    }
}

function resetProductForm() {
    document.getElementById('adminTitle').value = '';
    document.getElementById('adminBrand').value = '';
    document.getElementById('adminDescription').value = '';
    document.getElementById('adminPrice').value = '';
    document.getElementById('imageInput').value = '';
    document.getElementById('imagePreview').src = '';
    document.getElementById('imagePreview').style.display = 'none';
}

// === Cart Management ===
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        alert(getTranslatedMessage('Product not found!'));
        return;
    }
    const existingItem = cart.find(item => item.productId === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ productId, quantity: 1 });
    }
    saveCart();
    renderCart();
    alert(getTranslatedMessage('Product added to cart!'));
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return;
        const itemTotal = product.price * item.quantity;
        total += itemTotal;
        const cartItem = document.createElement('div');
        cartItem.className = 'card';
        cartItem.innerHTML = `
            <img src="${product.image}" alt="${product.title}" style="height: 100px;">
            <div class="title">${product.title}</div>
            <div class="price">${settings.currency}${itemTotal.toLocaleString()} (${item.quantity}x)</div>
            <div class="product-actions">
                <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${item.productId}, this.value)" style="width: 60px;">
                <button class="btn danger" onclick="removeFromCart(${item.productId})">${getTranslatedMessage('Remove')}</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });

    document.getElementById('cartTotal').textContent = `${getTranslatedMessage('Total')}: ${settings.currency}${total.toLocaleString()}`;
    document.getElementById('orderDetails').value = cart.map(item => {
        const product = products.find(p => p.id === item.productId);
        return product ? `${product.title} x ${item.quantity} = ${settings.currency}${product.price * item.quantity}` : '';
    }).filter(Boolean).join('\n');
    document.getElementById('orderTotal').value = `${settings.currency}${total.toLocaleString()}`;
}

function updateQuantity(productId, quantity) {
    quantity = parseInt(quantity);
    if (quantity >= 1) {
        const item = cart.find(i => i.productId === productId);
        if (item) {
            item.quantity = quantity;
            saveCart();
            renderCart();
        }
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    saveCart();
    renderCart();
}

function clearCart() {
    if (confirm(getTranslatedMessage('Are you sure you want to clear the cart?'))) {
        cart = [];
        saveCart();
        renderCart();
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// === Order Management ===
function showOrderForm(productId = null) {
    if (productId !== null) {
        const product = products.find(p => p.id === productId);
        if (product) {
            cart = [{ productId, quantity: 1 }];
            saveCart();
            renderCart();
        }
    }
    document.getElementById('orderForm').style.display = 'flex';
    document.getElementById('orderSummary').innerHTML = cart.map(item => {
        const product = products.find(p => p.id === item.productId);
        return product ? `<div>${product.title} x ${item.quantity} = ${settings.currency}${(product.price * item.quantity).toLocaleString()}</div>` : '';
    }).filter(Boolean).join('') + `<div style="font-weight: bold; margin-top: 10px;">${getTranslatedMessage('Total')}: ${document.getElementById('orderTotal').value}</div>`;
}

function hideOrderForm() {
    document.getElementById('orderForm').style.display = 'none';
    document.getElementById('orderFormDetails').reset();
}

document.getElementById('orderFormDetails').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('orderName').value.trim();
    const email = document.getElementById('orderEmail').value.trim();
    const phone = document.getElementById('orderPhone').value.trim();
    const address = document.getElementById('orderAddress').value.trim();
    const orderDetails = document.getElementById('orderDetails').value;
    const orderTotal = document.getElementById('orderTotal').value;

    if (!name || !email || !phone || !address) {
        alert(getTranslatedMessage('Please fill all required fields'));
        return;
    }

    const newAddress = { name, email, phone, address, date: new Date().toLocaleString() };
    addresses.push(newAddress);
    localStorage.setItem('addresses', JSON.stringify(addresses));

    // Save order to API
    const orderData = {
        name,
        email,
        phone,
        address,
        order_details: orderDetails,
        order_total: orderTotal,
        date: new Date().toLocaleString(),
        status: 'pending'
    };

    try {
        // Save to both local storage and API
        await saveOrderToAPI(orderData);
        
        // Send email notification
        await emailjs.send('service_hwvi11g', 'template_kp1zovr', {
            to_email: ADMIN_EMAIL,
            from_name: name,
            from_email: email,
            phone,
            address,
            order_details: orderDetails,
            order_total: orderTotal,
            message: `New order from ${name} at ${new Date().toLocaleString()}`
        });

        alert(getTranslatedMessage('Order placed successfully! We will contact you soon.'));
        cart = [];
        saveCart();
        renderCart();
        hideOrderForm();
    } catch (err) {
        console.error('Error:', err);
        alert(getTranslatedMessage('Order placed but email failed'));
    }
});

// === Seller Account Management ===
async function createSellerAccount() {
    const name = document.getElementById('sellerName').value.trim();
    const email = document.getElementById('sellerEmail').value.trim();
    const phone = document.getElementById('sellerPhone').value.trim();
    const address = document.getElementById('sellerAddress').value.trim();
    const bank = document.getElementById('sellerBank').value.trim();
    const id = document.getElementById('sellerID').value.trim();

    if (!name || !email || !phone || !address || !bank || !id) {
        alert(getTranslatedMessage('Please fill all required fields'));
        return;
    }

    if (pendingSellers.find(s => s.email === email) || approvedSellers.find(s => s.email === email)) {
        alert(getTranslatedMessage('Email already registered!'));
        return;
    }

    const newSeller = { 
        name, 
        email, 
        phone, 
        address, 
        bank, 
        id, 
        status: 'pending', 
        date: new Date().toLocaleString(), 
        products: [] 
    };

    try {
        // Save to both local storage and API
        pendingSellers.push(newSeller);
        localStorage.setItem('pendingSellers', JSON.stringify(pendingSellers));
        await saveSellerToAPI(newSeller);

        // Send email notification
        await emailjs.send('service_hwvi11g', 'template_kp1zovr', {
            to_email: ADMIN_EMAIL,
            from_name: name,
            from_email: email,
            phone,
            address,
            bank_details: bank,
            id_number: id,
            message: `New seller account request from ${name} at ${new Date().toLocaleString()}`
        });

        alert(getTranslatedMessage('Seller account request submitted! Wait for admin approval.'));
        resetSellerForm();
        renderPendingSellers();
    } catch (err) {
        console.error('Error:', err);
        alert(getTranslatedMessage('Request submitted but email failed'));
    }
}

function renderPendingSellers() {
    const pendingSellersDiv = document.getElementById('pendingSellers');
    pendingSellersDiv.innerHTML = '';
    pendingSellers.forEach((seller, index) => {
        const sellerCard = document.createElement('div');
        sellerCard.className = 'card';
        sellerCard.innerHTML = `
            <div class="title">${seller.name}</div>
            <div>Email: ${seller.email}</div>
            <div>Phone: ${seller.phone}</div>
            <div>Address: ${seller.address}</div>
            <div>Bank: ${seller.bank}</div>
            <div>ID: ${seller.id}</div>
            <div class="product-actions">
                <button class="btn success" onclick="approveSeller(${index})">${getTranslatedMessage('Approve')}</button>
                <button class="btn danger" onclick="rejectSeller(${index})">${getTranslatedMessage('Reject')}</button>
            </div>
        `;
        pendingSellersDiv.appendChild(sellerCard);
    });
}

async function approveSeller(index) {
    const seller = pendingSellers[index];
    seller.status = 'approved';
    approvedSellers.push(seller);
    pendingSellers.splice(index, 1);
    localStorage.setItem('pendingSellers', JSON.stringify(pendingSellers));
    localStorage.setItem('approvedSellers', JSON.stringify(approvedSellers));

    try {
        // Update seller status in API
        await saveSellerToAPI({ ...seller, status: 'approved' });
        
        // Send approval email
        await emailjs.send('service_hwvi11g', 'template_kp1zovr', {
            to_email: seller.email,
            from_name: settings.storeName,
            message: `Your seller account has been approved! You can now start selling on ${settings.storeName}.`
        });

        alert(getTranslatedMessage('Seller account approved and email sent!'));
        renderPendingSellers();
    } catch (err) {
        console.error('Error:', err);
        alert(getTranslatedMessage('Seller account approved but email failed'));
    }
}

async function rejectSeller(index) {
    const seller = pendingSellers[index];
    pendingSellers.splice(index, 1);
    localStorage.setItem('pendingSellers', JSON.stringify(pendingSellers));

    try {
        // Update seller status in API
        await saveSellerToAPI({ ...seller, status: 'rejected' });
        
        // Send rejection email
        await emailjs.send('service_hwvi11g', 'template_kp1zovr', {
            to_email: seller.email,
            from_name: settings.storeName,
            message: `Your seller account request has been rejected. Please contact support for more information.`
        });

        alert(getTranslatedMessage('Seller account rejected and email sent!'));
        renderPendingSellers();
    } catch (err) {
        console.error('Error:', err);
        alert(getTranslatedMessage('Seller account rejected but email failed'));
    }
}

function resetSellerForm() {
    document.getElementById('sellerName').value = '';
    document.getElementById('sellerEmail').value = '';
    document.getElementById('sellerPhone').value = '';
    document.getElementById('sellerAddress').value = '';
    document.getElementById('sellerBank').value = '';
    document.getElementById('sellerID').value = '';
    document.getElementById('sellerStep2').classList.remove('active');
    document.getElementById('sellerStep1').classList.add('active');
}

// === Customer Signup ===
async function createCustomerAccount() {
    const name = document.getElementById('customerName').value.trim();
    const email = document.getElementById('customerEmail').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const address = document.getElementById('customerAddress').value.trim();
    const password = document.getElementById('customerPassword').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !phone || !address || !password) {
        alert(getTranslatedMessage('Please fill all required fields'));
        return;
    }

    if (customers.find(c => c.email === email)) {
        alert(getTranslatedMessage('Email already registered!'));
        return;
    }

    if (!emailRegex.test(email)) {
        alert(getTranslatedMessage('Invalid email format'));
        return;
    }

    const newCustomer = { 
        name, 
        email, 
        phone, 
        address, 
        password, 
        verified: true, 
        date: new Date().toLocaleString() 
    };

    try {
        // Save to both local storage and API
        customers.push(newCustomer);
        localStorage.setItem('customers', JSON.stringify(customers));
        await saveCustomerToAPI(newCustomer);
        
        // Send welcome email
        await emailjs.send('service_hwvi11g', 'template_kp1zovr', {
            to_email: email,
            from_name: settings.storeName,
            message: `Welcome to ${settings.storeName}! Your account has been created successfully.`
        });

        alert(getTranslatedMessage('Account created successfully! Email sent.'));
        resetCustomerForm();
    } catch (err) {
        console.error('Error:', err);
        alert(getTranslatedMessage('Account created but email failed'));
    }
}

function resetCustomerForm() {
    document.getElementById('customerName').value = '';
    document.getElementById('customerEmail').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerAddress').value = '';
    document.getElementById('customerPassword').value = '';
}

// === Wish List ===
function addToWishList(productId) {
    if (!products.find(p => p.id === productId)) {
        alert(getTranslatedMessage('Product not found!'));
        return;
    }
    if (!wishList.includes(productId)) {
        wishList.push(productId);
        localStorage.setItem('wishList', JSON.stringify(wishList));
        alert(getTranslatedMessage('Product added to wishlist!'));
    } else {
        alert(getTranslatedMessage('Product already in wishlist!'));
    }
    renderWishList();
}

function renderWishList() {
    const wishListDiv = document.getElementById('wishList');
    wishListDiv.innerHTML = `<h3>${getTranslatedMessage('Wishlist')}</h3>`;
    wishList.forEach((productId, i) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        const wishItem = document.createElement('div');
        wishItem.className = 'card';
        wishItem.innerHTML = `
            <img src="${product.image}" alt="${product.title}" style="height: 100px;">
            <div class="title">${product.title}</div>
            <div class="price">${settings.currency}${product.price.toLocaleString()}</div>
            <button class="btn danger" onclick="removeFromWishList(${i})">${getTranslatedMessage('Remove')}</button>
        `;
        wishListDiv.appendChild(wishItem);
    });
}

function removeFromWishList(index) {
    wishList.splice(index, 1);
    localStorage.setItem('wishList', JSON.stringify(wishList));
    renderWishList();
}

// === Reviews ===
function addReview(event, productId) {
    event.preventDefault();
    const form = event.target;
    const name = form.querySelector('input').value.trim();
    const comment = form.querySelector('textarea').value.trim();
    const rating = form.querySelector('select').value;

    if (!name || !comment || !rating) {
        alert(getTranslatedMessage('Please fill all review fields'));
        return;
    }

    const product = products.find(p => p.id === productId);
    if (product) {
        product.reviews.push({ customer: name, comment, rating: parseInt(rating), date: new Date().toLocaleString() });
        localStorage.setItem('products', JSON.stringify(products));
        renderProducts();
        form.reset();
        alert(getTranslatedMessage('Review submitted successfully!'));
    }
}

// === Search and Filter ===
function setupSearchAndFilter() {
    document.getElementById('searchInput')?.addEventListener('input', renderProducts);
    document.getElementById('filterSelect')?.addEventListener('change', renderProducts);
}

// === Password Prompt (Admin Access) ===
function showPasswordPrompt(action) {
    currentAction = action;
    document.getElementById('passwordPrompt').style.display = 'flex';
    document.getElementById('adminPasswordInput').focus();
}

function verifyPassword() {
    const password = document.getElementById('adminPasswordInput').value;
    if (password === ADMIN_PASSWORD) {
        isAdmin = true;
        localStorage.setItem('isAdmin', 'true');
        document.getElementById('passwordPrompt').style.display = 'none';
        if (currentAction === 'addProduct') addProduct();
        else if (currentAction === 'accessSettings') {
            showPage('settings');
        }
    } else {
        document.getElementById('passwordError').style.display = 'block';
    }
}

function hidePasswordPrompt() {
    document.getElementById('passwordPrompt').style.display = 'none';
    document.getElementById('passwordError').style.display = 'none';
}

// === Navigation ===
function toggleMenu() {
    document.getElementById('threeLineMenu').classList.toggle('active');
}

function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page${page.charAt(0).toUpperCase() + page.slice(1)}`).classList.add('active');
    document.getElementById('threeLineMenu').classList.remove('active');
    if (page === 'settings' && !isAdmin) {
        showPasswordPrompt('accessSettings');
    }
}

// === Seller Steps ===
function nextSellerStep(current, next) {
    if (current === 1) {
        const name = document.getElementById('sellerName').value.trim();
        const email = document.getElementById('sellerEmail').value.trim();
        const phone = document.getElementById('sellerPhone').value.trim();
        if (!name || !email || !phone) {
            alert(getTranslatedMessage('Please fill all required fields'));
            return;
        }
    }
    document.getElementById(`sellerStep${current}`).classList.remove('active');
    document.getElementById(`sellerStep${next}`).classList.add('active');
}

function prevSellerStep(current, prev) {
    document.getElementById(`sellerStep${current}`).classList.remove('active');
    document.getElementById(`sellerStep${prev}`).classList.add('active');
}

// === Address Book ===
function saveAddress() {
    const name = document.getElementById('custName').value.trim();
    const email = document.getElementById('custEmail').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();

    if (!name || !email || !phone || !address) {
        alert(getTranslatedMessage('Please fill all required fields'));
        return;
    }

    addresses.push({ name, email, phone, address, date: new Date().toLocaleString() });
    localStorage.setItem('addresses', JSON.stringify(addresses));
    alert(getTranslatedMessage('Address saved successfully!'));
    resetAddress();
}

function resetAddress() {
    document.getElementById('custName').value = '';
    document.getElementById('custEmail').value = '';
    document.getElementById('custPhone').value = '';
    document.getElementById('custAddress').value = '';
}

// === Cart Panel Toggle ===
function toggleCart() {
    const cartPanel = document.getElementById('cartPanel');
    cartPanel.style.display = cartPanel.style.display === 'block' ? 'none' : 'block';
}