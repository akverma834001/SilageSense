// Smart FeedCheck - Localization Dictionary (English & Hindi)

export const translations = {
  en: {
    // Brand
    brandName: "SilageSense",
    tagline: "Simple testing. Better feeding decisions.",
    screeningDisclaimer: "Screening assessment only. Not a certified laboratory test. Confirm with lab when required.",
    
    // Navigation
    navHome: "Home",
    navTest: "Test",
    navHistory: "History",
    navDevice: "Device",
    navLearn: "Learn",
    navSettings: "Settings",

    // Banner / System
    demoBadge: "DEMO MODE",
    offlineBadge: "Offline Ready",
    onlineBadge: "Cloud Connected",
    deviceConnected: "Device connected ✓",
    deviceDisconnected: "Device not connected",
    farmerModeBadge: "Farmer Mode",
    expertModeBadge: "Expert Mode",
    voiceOn: "Voice On",
    voiceOff: "Voice Mute",

    // Home Screen
    greetingMorning: "Good morning",
    greetingAfternoon: "Good afternoon",
    greetingEvening: "Good evening",
    questionWhatToTest: "What would you like to test?",
    silageTitle: "Silage",
    silageSubtitle: "Maize, sorghum, grass silage ferment screening",
    feedTitle: "Cattle Feed",
    feedSubtitle: "Pellets, mash, concentrate moisture & freshness",
    startTestBtn: "Start Test",
    recentTestsHeader: "Recent Tests",
    viewAllTestsBtn: "View all tests",
    noRecentTests: "No tests completed yet. Start your first test above.",
    demoScenariosTitle: "1-Click Evaluation Scenarios",
    scenarioNormalSilage: "Normal Silage",
    scenarioReviewRequired: "Review Required",
    scenarioPoorImage: "Poor Camera View",
    scenarioUnknownOOD: "Unknown Sample",
    scenarioManualOnly: "Manual Entry Only",

    // Test Flow
    stepPrepareTitle: "Prepare your sample",
    stepPrepareInstruction: "Take a representative sample of feed or silage from 3-4 different points and mix gently.",
    stepPrepareBtn: "Continue",
    
    stepCupTitle: "Sample Cup",
    stepCupInstruction: "Fill the cup to the marked fill line. Do not overpack or leave it half empty.",
    stepCupReadyBtn: "Sample ready",
    correctSampleBadge: "Correct fill level",
    incorrectSampleBadge: "Avoid overfilling",

    stepDeviceCheckTitle: "Checking device…",
    stepDeviceCheckSubtitle: "Verifying sensors, optical chamber, and battery status",
    deviceReadySuccess: "Device ready ✓",
    deviceAttentionReq: "Device needs attention",
    deviceCheckRetry: "Try again",
    deviceCheckHelp: "Device help",
    
    stepWeightTitle: "Checking sample amount…",
    stepWeightOk: "Sample amount OK ✓",
    stepWeightUnder: "Add a little more sample.",
    stepWeightOver: "Remove a small amount of sample.",
    
    stepImagingTitle: "Looking at your sample…",
    stepImagingSubtitle: "Controlled LED illumination and surface texture scan",
    imageQualityOk: "Image accepted ✓",
    imageQualityFail: "We couldn't get a clear view of the sample.",
    retakeImageBtn: "Retake photo",
    
    stepSensorsTitle: "Measuring sample…",
    measuringPH: "Measuring pH…",
    checkingTemp: "Checking temperature…",
    examiningVisual: "Examining sample appearance…",
    completingAssessment: "Completing assessment…",
    
    // Manual entry
    addInfoTitle: "Add known information",
    addInfoSubtitle: "Do you already know anything about this sample? (All fields are optional)",
    phLabel: "pH reading",
    moistureLabel: "Moisture (%)",
    tempLabel: "Temperature (°C)",
    cropTypeLabel: "Crop / Material",
    storageMethodLabel: "Storage method",
    smellObservationLabel: "Smell / Odour",
    visibleMoldLabel: "Visible mould noticed?",
    skipBtn: "I don't know / Skip",
    saveManualBtn: "Apply information",
    
    // Conflict resolution
    conflictTitle: "Two different values found",
    conflictSubtitle: "We found different readings between your device and manual input:",
    deviceReadingLabel: "Device reading:",
    manualReadingLabel: "Manual entry:",
    useDeviceBtn: "Use device reading",
    useManualBtn: "Use manual reading",
    retestBtn: "Retest parameter",

    // Results
    assessmentTitle: "Screening Assessment",
    resultNormalHeadline: "Screening Consistent",
    resultNormalSub: "The measured indicators are consistent with a normally fermented, safe sample.",
    resultReviewHeadline: "Review Required",
    resultReviewSub: "One or more indicators deviate from expected benchmarks. Follow recommendations below.",
    resultLabHeadline: "Laboratory Confirmation Required",
    resultLabSub: "Critical flags detected (such as heating or severe mould). Do not feed before verification.",
    resultUnknownHeadline: "Unable to Assess Confidently",
    resultUnknownSub: "This sample is significantly different from validated references. Confirm with a lab test.",
    
    indicatorsHeader: "Key Measured Indicators",
    phIndicator: "pH",
    moistureIndicator: "Moisture estimate",
    tempIndicator: "Sample temperature",
    mouldIndicator: "Visible mould",
    heatingIndicator: "Heating indicator",
    notDetected: "Not detected",
    detectedAlert: "Detected / Caution",
    normalState: "Normal",
    elevatedState: "Elevated / Heating",
    
    recommendationHeader: "Recommendation",
    whyResultBtn: "Why this result?",
    technicalDetailsBtn: "View technical details",
    saveTestBtn: "Save Record",
    printReportBtn: "Print / Export Report",
    newTestBtn: "Start New Test",

    // Device Screen
    devicePageTitle: "Device Management",
    deviceStatusHeader: "SilageSense Instrument",
    batteryLabel: "Battery",
    calibrationLabel: "Calibration",
    upToDate: "Up to date",
    dueSoon: "Due soon",
    firmwareLabel: "Firmware",
    calibrateDeviceBtn: "Calibrate pH & Sensors",
    runDeviceCheckBtn: "Run Sensor Self-Test",
    deviceHardwareSandbox: "Tester Hardware Simulation Sandbox",

    // History
    historyTitle: "Test History",
    filterAll: "All",
    filterSilage: "Silage",
    filterFeed: "Feed",
    noHistoryMatch: "No test records found for this filter.",
    todayHeader: "Today",
    yesterdayHeader: "Yesterday",
    olderHeader: "Earlier",

    // Learn
    learnTitle: "Field Knowledge & Guides",
    learnSubtitle: "Practical dairy feeding and silage quality management",
    
    // Settings
    settingsTitle: "Settings & Profile",
    farmProfileHeader: "Farm & Operator",
    farmNameLabel: "Farm / Dairy Name",
    operatorNameLabel: "Operator Name",
    languageSettingLabel: "Language",
    unitsSettingLabel: "Temperature Unit",
    expertModeLabel: "Expert Mode (Technical Telemetry)",
    voiceAssistanceLabel: "Voice Audio Guidance",
    offlineSyncHeader: "Offline Data & Sync",
    pendingSyncCount: "pending records in offline queue",
    syncNowBtn: "Sync with Cloud Now",
    resetDataBtn: "Reset Demo Data"
  },
  
  hi: {
    // Brand
    brandName: "साइलेजसेंस (SilageSense)",
    tagline: "सरल परीक्षण। बेहतर चारा निर्णय।",
    screeningDisclaimer: "यह केवल प्राथमिक स्क्रीनिंग है। प्रयोगशाला परीक्षण का विकल्प नहीं है। आवश्यकता पड़ने पर लैब से पुष्टि करें।",
    
    // Navigation
    navHome: "होम",
    navTest: "परीक्षण",
    navHistory: "इतिहास",
    navDevice: "डिवाइस",
    navLearn: "सीखें",
    navSettings: "सेटिंग्स",

    // Banner / System
    demoBadge: "डेमो मोड",
    offlineBadge: "ऑफ़लाइन तैयार",
    onlineBadge: "क्लाउड कनेक्टेड",
    deviceConnected: "डिवाइस कनेक्टेड ✓",
    deviceDisconnected: "डिवाइस डिस्कनेक्टेड",
    farmerModeBadge: "किसान मोड",
    expertModeBadge: "विशेषज्ञ मोड",
    voiceOn: "आवाज़ चालू",
    voiceOff: "आवाज़ बंद",

    // Home Screen
    greetingMorning: "शुभ प्रभात",
    greetingAfternoon: "नमस्कार",
    greetingEvening: "शुभ संध्या",
    questionWhatToTest: "आप क्या परीक्षण करना चाहते हैं?",
    silageTitle: "साइलेज (अचार चारा)",
    silageSubtitle: "मक्का, ज्वार, घास साइलेज किण्वन गुणवत्ता",
    feedTitle: "पशु आहार (दाना)",
    feedSubtitle: "पेलेट्स, दलिया, खली नमी और ताज़गी जांच",
    startTestBtn: "परीक्षण शुरू करें",
    recentTestsHeader: "हाल के परीक्षण",
    viewAllTestsBtn: "सभी परीक्षण देखें",
    noRecentTests: "अभी तक कोई परीक्षण नहीं किया गया है। ऊपर शुरू करें।",
    demoScenariosTitle: "1-क्लिक परीक्षण परिदृश्य",
    scenarioNormalSilage: "सामान्य साइलेज",
    scenarioReviewRequired: "समीक्षा आवश्यक",
    scenarioPoorImage: "धुंधली तस्वीर",
    scenarioUnknownOOD: "अपरिचित नमूना",
    scenarioManualOnly: "केवल मैनुअल प्रविष्टि",

    // Test Flow
    stepPrepareTitle: "अपना नमूना तैयार करें",
    stepPrepareInstruction: "साइलेज या चारे को 3-4 अलग-अलग जगहों से निकालें और हल्के हाथ से मिलाएं।",
    stepPrepareBtn: "आगे बढ़ें",
    
    stepCupTitle: "सैंपल कप भरें",
    stepCupInstruction: "कप को दिए गए निशान (Fill Line) तक भरें। ज्यादा दबाएं नहीं और न ही आधा खाली छोड़ें।",
    stepCupReadyBtn: "नमूना तैयार है",
    correctSampleBadge: "सही स्तर",
    incorrectSampleBadge: "अत्यधिक न भरें",

    stepDeviceCheckTitle: "डिवाइस की जांच हो रही है…",
    stepDeviceCheckSubtitle: "सेंसर, चैंबर और बैटरी की स्थिति जांची जा रही है",
    deviceReadySuccess: "डिवाइस तैयार है ✓",
    deviceAttentionReq: "डिवाइस पर ध्यान देने की जरूरत है",
    deviceCheckRetry: "दोबारा कोशिश करें",
    deviceCheckHelp: "मदद लें",
    
    stepWeightTitle: "नमूने की मात्रा जांची जा रही है…",
    stepWeightOk: "मात्रा सही है ✓",
    stepWeightUnder: "थोड़ा और नमूना डालें।",
    stepWeightOver: "थोड़ा नमूना कम करें।",
    
    stepImagingTitle: "नमूने की तस्वीर ली जा रही है…",
    stepImagingSubtitle: "एलईडी प्रकाश में सतह और रंग की जांच",
    imageQualityOk: "तस्वीर स्वीकार हुई ✓",
    imageQualityFail: "नमूने की साफ़ तस्वीर नहीं मिल सकी।",
    retakeImageBtn: "दोबारा फोटो लें",
    
    stepSensorsTitle: "मापन हो रहा है…",
    measuringPH: "pH मापा जा रहा है…",
    checkingTemp: "तापमान जाँचा जा रहा है…",
    examiningVisual: "दिखावट का विश्लेषण हो रहा है…",
    completingAssessment: "आकलन पूरा किया जा रहा है…",
    
    // Manual entry
    addInfoTitle: "ज्ञात जानकारी जोड़ें",
    addInfoSubtitle: "क्या आप इस नमूने के बारे में पहले से कुछ जानते हैं? (सभी फ़ील्ड वैकल्पिक हैं)",
    phLabel: "pH मान",
    moistureLabel: "नमी (%)",
    tempLabel: "तापमान (°C)",
    cropTypeLabel: "फसल / प्रकार",
    storageMethodLabel: "भंडारण विधि",
    smellObservationLabel: "गंध / महक",
    visibleMoldLabel: "क्या फफूंद दिखाई दे रही है?",
    skipBtn: "पता नहीं / छोड़ें",
    saveManualBtn: "जानकारी लागू करें",
    
    // Conflict resolution
    conflictTitle: "दो अलग-अलग मान मिले",
    conflictSubtitle: "डिवाइस और आपके द्वारा दर्ज किए गए मान में अंतर है:",
    deviceReadingLabel: "डिवाइस मान:",
    manualReadingLabel: "मैनुअल मान:",
    useDeviceBtn: "डिवाइस का मान लें",
    useManualBtn: "मैनुअल मान लें",
    retestBtn: "दोबारा जांचें",

    // Results
    assessmentTitle: "जांच परिणाम",
    resultNormalHeadline: "स्क्रीनिंग सामान्य",
    resultNormalSub: "मापे गए सभी संकेतक सामान्य किण्वित और सुरक्षित नमूने के अनुरूप हैं।",
    resultReviewHeadline: "समीक्षा आवश्यक",
    resultReviewSub: "एक या अधिक संकेतकों में विचलन पाया गया है। नीचे दी गई सिफारिशों को देखें।",
    resultLabHeadline: "प्रयोगशाला पुष्टि आवश्यक",
    resultLabSub: "गंभीर संकेतक (जैसे अधिक तापमान या फफूंद) पाए गए हैं। पुष्टि से पहले पशुओं को न खिलाएं।",
    resultUnknownHeadline: "विश्वासपूर्वक आकलन असमर्थ",
    resultUnknownSub: "यह नमूना मान्य संदर्भ नमूनों से काफी अलग है। प्रयोगशाला में जांच कराएं।",
    
    indicatorsHeader: "प्रमुख मापे गए संकेतक",
    phIndicator: "pH मान",
    moistureIndicator: "अनुमानित नमी",
    tempIndicator: "नमूने का तापमान",
    mouldIndicator: "दिखने वाली फफूंद",
    heatingIndicator: "गर्माहट संकेतक",
    notDetected: "नहीं मिली",
    detectedAlert: "दिखाई दी / सतर्क रहें",
    normalState: "सामान्य",
    elevatedState: "अधिक / गर्म",
    
    recommendationHeader: "सिफारिश",
    whyResultBtn: "यह परिणाम क्यों?",
    technicalDetailsBtn: "तकनीकी विवरण देखें",
    saveTestBtn: "रिकॉर्ड सहेजें",
    printReportBtn: "रिपोर्ट प्रिंट / डाउनलोड करें",
    newTestBtn: "नया परीक्षण शुरू करें",

    // Device Screen
    devicePageTitle: "डिवाइस प्रबंधन",
    deviceStatusHeader: "साइलेजसेंस उपकरण",
    batteryLabel: "बैटरी",
    calibrationLabel: "अंशांकन (कैलिब्रेशन)",
    upToDate: "अप टू डेट",
    dueSoon: "शीघ्र आवश्यक",
    firmwareLabel: "फर्मवेयर",
    calibrateDeviceBtn: "pH व सेंसर कैलिब्रेट करें",
    runDeviceCheckBtn: "सेंसर सेल्फ-टेस्ट चलाएं",
    deviceHardwareSandbox: "हार्डवेयर सिम्युलेटर सैंडबॉक्स",

    // History
    historyTitle: "परीक्षण इतिहास",
    filterAll: "सभी",
    filterSilage: "साइलेज",
    filterFeed: "दाना",
    noHistoryMatch: "इस फ़िल्टर के लिए कोई रिकॉर्ड नहीं मिला।",
    todayHeader: "आज",
    yesterdayHeader: "कल",
    olderHeader: "पुराने",

    // Learn
    learnTitle: "कृषि ज्ञान व मार्गदर्शिका",
    learnSubtitle: "डेयरी पशु आहार और साइलेज की गुणवत्ता प्रबंधन",
    
    // Settings
    settingsTitle: "सेटिंग्स व प्रोफ़ाइल",
    farmProfileHeader: "डेयरी व संचालक",
    farmNameLabel: "डेयरी / फार्म का नाम",
    operatorNameLabel: "संचालक का नाम",
    languageSettingLabel: "भाषा",
    unitsSettingLabel: "तापमान इकाई",
    expertModeLabel: "विशेषज्ञ मोड (तकनीकी टेलीमेट्री)",
    voiceAssistanceLabel: "आवाज़ मार्गदर्शन",
    offlineSyncHeader: "ऑफ़लाइन डेटा व सिंक",
    pendingSyncCount: "रिकॉर्ड ऑफ़लाइन कतार में सुरक्षित हैं",
    syncNowBtn: "अभी सिंक करें",
    resetDataBtn: "डेमो डेटा रीसेट करें"
  }
};
