const locations = {
    Palestine: {
        name: "فلسطين",
        apiName: "Palestine",
        method: 8, 
        cities: ["القدس", "غزة", "رام الله", "الخليل", "نابلس", "جنين", "طولكرم", "بيت لحم", "أريحا"]
    },
    Jordan: {
        name: "الأردن",
        apiName: "Jordan",
        method: 23, 
        cities: ["عمّان", "الزرقاء", "إربد", "العقبة", "مادبا"]
    },
    Egypt: {
        name: "مصر",
        apiName: "Egypt",
        method: 5,
        cities: ["القاهرة", "الإسكندرية", "الجيزة", "الأقصر", "أسوان"]
    },
    Saudi_Arabia: {
        name: "السعودية",
        apiName: "Saudi Arabia",
        method: 4, 
        cities: ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام"]
    }
};

const countrySelect = document.getElementById("country");
const citySelect = document.getElementById("city");
const locationElement = document.getElementById("location");
const dateElement = document.getElementById("date");
const loadingElement = document.getElementById("loading");
const errorElement = document.getElementById("error");
const btn = document.getElementById("btn");

// تعبئة قائمة الدول
for (let countryKey in locations) {
    const countryName = locations[countryKey].name;
    countrySelect.innerHTML += `<option value="${countryKey}">${countryName}</option>`;
}

// عند تغيير الدولة، يتم تحديث قائمة المدن
countrySelect.addEventListener("change", function () {
    const selectedCountryKey = countrySelect.value;

    // تفريغ رسالة الخطأ السابقة إن وجدت
    errorElement.innerHTML = "";

    if (!selectedCountryKey || !locations[selectedCountryKey]) {
        citySelect.innerHTML = '<option value="" disabled selected>اختر المدينة</option>';
        citySelect.disabled = true;
        return;
    }

    const citiesArray = locations[selectedCountryKey].cities;

    // تفريغ قائمة المدن القديمة
    citySelect.innerHTML = '<option value="" disabled selected>اختر المدينة</option>';
    citySelect.disabled = false;

    // إضافة المدن الجديدة
    for (let i = 0; i < citiesArray.length; i++) {
        const cityName = citiesArray[i];
        citySelect.innerHTML += `<option value="${cityName}">${cityName}</option>`;
    }
});

// تحديث العنوان عند اختيار المدينة
citySelect.addEventListener("change", function () {
    if (!countrySelect.value || !citySelect.value) return;
    locationElement.innerHTML = `${locations[countrySelect.value].name} - ${citySelect.value}`;
});

// زر عرض المواقيت وجلب البيانات من الـ API
btn.addEventListener("click", function () {
    const countryKey = countrySelect.value;
    const city = citySelect.value;

    // تفريغ رسالة الخطأ السابقة
    errorElement.innerHTML = "";

    // التأكد من اختيار الدولة والمدينة
    if (!countryKey || !locations[countryKey] || !city) {
        errorElement.innerHTML = "الرجاء اختيار الدولة والمدينة أولاً!";
        return;
    }

    const countryData = locations[countryKey];

    // تعطيل الزر ومنع الضغط المتكرر أثناء التحميل
    btn.disabled = true;
    loadingElement.style.display = "block";

    const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(countryData.apiName)}&method=${countryData.method}`;

    fetch(url)
        .then(function (response) {
            if (!response.ok) {
                throw new Error("فشل في جلب البيانات، تأكد من الاتصال بالإنترنت.");
            }
            return response.json();
        })
        .then(function (data) {
            const timings = data.data.timings;
            const readableDate = data.data.date.readable; // التاريخ الميلادي
            const hijriDate = data.data.date.hijri.date;   // التاريخ الهجري

            // تحديث مواقيت الصلاة في الواجهة
            document.getElementById("fajr").textContent = timings.Fajr;
            document.getElementById("sunrise").textContent = timings.Sunrise;
            document.getElementById("dhuhr").textContent = timings.Dhuhr;
            document.getElementById("asr").textContent = timings.Asr;
            document.getElementById("maghrib").textContent = timings.Maghrib;
            document.getElementById("isha").textContent = timings.Isha;

            // تحديث التاريخ
            dateElement.textContent = `${readableDate} | الموافق هجري: ${hijriDate}`;
        })
        .catch(function (error) {
            errorElement.innerHTML = error.message;
            console.log("حدث خطأ:", error);
        })
        .finally(function () {
            // إخفاء التحميل وإعادة تفعيل الزر في كل الحالات
            loadingElement.style.display = "none";
            btn.disabled = false;
        });
});