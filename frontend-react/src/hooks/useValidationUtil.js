// Validate email format
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate phone number format (7 to 15 digits)
export const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^[0-9]{7,15}$/; // You can adjust this regex according to your needs
    return phoneRegex.test(phoneNumber);
};

// Validate file upload (check if file exists and type is valid)
export const validateFileUpload = (file) => {
    if (!file) {
        return "No file uploaded. Please upload a file.";
    }
    const validFileTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]; // Allowed types: PDF, DOC, DOCX
    if (!validFileTypes.includes(file.type)) {
        return "Invalid file type. Only PDF, DOC, and DOCX files are allowed.";
    }
    if (file.size > 200 * 1024 * 1024) {
        // 2 MB size limit
        return "File size exceeds the limit of 2MB.";
    }
    return "";
};

export const validateAdditionalQuestions = (questions, positionTitle) => {
    // let errors = {};
    // Assuming position title "Accounting"
    //  if (positionTitle.toLowerCase() === "accounting") {
    //  if (!questions.question1) {
    //     errors.question1 =
    //          "Please indicate if you have a Bachelor's Degree.";
    //   }
    //   if (!questions.question2) {
    //      errors.question2 =
    //          "Please indicate if you're willing to undergo a background check.";
    //  }
    // if (!questions.commute) {
    //     errors.commute = "Please indicate if you're comfortable commuting.";
    // }
    // if (!questions.onsite) {
    //     errors.onsite =
    //           "Please indicate if you're comfortable working onsite.";
    // }
    // if (!questions.workSaturdays) {
    //    errors.workSaturdays =
    //        "Please select your willingness to work on Saturdays.";
    // }
    // if (!questions.accountancyGraduate) {
    //    errors.accountancyGraduate =
    //        "Please indicate if you're an Accountancy graduate.";
    // }
    // if (!questions.englishProficiency) {
    //     errors.englishProficiency =
    //          "Please select your English proficiency level.";
    //  }
    //  if (!questions.accountingExperience) {
    //     errors.accountingExperience =
    //         "Please specify your Accounting experience.";
    //  }
    // if (!questions.softwareExperience) {
    //     errors.softwareExperience =
    //        "Please specify your experience with Accounting Software.";
    // }
    // }
    // if (positionTitle.toLowerCase() === "accounting") {
    //     if (!questions.bachelorDegree) {
    //         errors.bachelorDegree =
    //             "Please indicate if you have a Bachelor's Degree.";
    //     }
    //     if (!questions.backgroundCheck) {
    //         errors.backgroundCheck =
    //             "Please indicate if you're willing to undergo a background check.";
    //     }
    // if (!questions.commute) {
    //     errors.commute = "Please indicate if you're comfortable commuting.";
    // }
    // if (!questions.onsite) {
    //     errors.onsite =
    //           "Please indicate if you're comfortable working onsite.";
    // }
    // if (!questions.workSaturdays) {
    //    errors.workSaturdays =
    //        "Please select your willingness to work on Saturdays.";
    // }
    // if (!questions.accountancyGraduate) {
    //    errors.accountancyGraduate =
    //        "Please indicate if you're an Accountancy graduate.";
    // }
    // if (!questions.englishProficiency) {
    //     errors.englishProficiency =
    //          "Please select your English proficiency level.";
    //  }
    //  if (!questions.accountingExperience) {
    //     errors.accountingExperience =
    //         "Please specify your Accounting experience.";
    //  }
    // if (!questions.softwareExperience) {
    //     errors.softwareExperience =
    //        "Please specify your experience with Accounting Software.";
    // }
    // }
    // return errors;
};
