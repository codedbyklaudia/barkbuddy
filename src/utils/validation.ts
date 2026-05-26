export interface ValidationErrors {
  [field: string]: string;
}
export const validateStep1 = (data: {
  email: string; name: string; password: string; confirmPassword: string;
}): ValidationErrors => {
  const errors: ValidationErrors = {};
  if (!data.email) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Please enter a valid email";
  if (!data.name) errors.name = "Name is required";
  else if (data.name.trim().length < 2) errors.name = "Name must be at least 2 characters";
  if (!data.password) errors.password = "Password is required";
  else if (data.password.length < 8) errors.password = "Password must be at least 8 characters";
  else if (!/[A-Z]/.test(data.password)) errors.password = "Must contain an uppercase letter";
  else if (!/[0-9]/.test(data.password)) errors.password = "Must contain a number";
  if (!data.confirmPassword) errors.confirmPassword = "Please confirm your password";
  else if (data.confirmPassword !== data.password) errors.confirmPassword = "Passwords do not match";
  return errors;
};
export const validateStep2 = (data: { dogName: string; breed: string }): ValidationErrors => {
  const errors: ValidationErrors = {};
  if (!data.dogName?.trim()) errors.dogName = "Please enter your dog's name";
  if (!data.breed) errors.breed = "Please select a breed";
  return errors;
};
export const validateStep3 = (data: {
  lifeStage: string; personality: string[]; dogDob?: string;
}): ValidationErrors => {
  const errors: ValidationErrors = {};
  if (!data.lifeStage) errors.lifeStage = "Please select a life stage";
  if (!data.personality || data.personality.length === 0) errors.personality = "Please select at least one personality trait";
  if (data.dogDob) {
    const dob = new Date(data.dogDob);
    if (isNaN(dob.getTime())) errors.dogDob = "Please enter a valid date";
    else if (dob > new Date()) errors.dogDob = "Date of birth cannot be in the future";
  }
  return errors;
};
// Step 4: Gender
export const validateStep4 = (data: { dogGender: string }): ValidationErrors => {
  const errors: ValidationErrors = {};
  if (!data.dogGender) errors.dogGender = "Please select your dog's gender";
  return errors;
};
// Step 5: Policies
export const validateStep5 = (accepted: Record<string, boolean>): ValidationErrors => {
  const errors: ValidationErrors = {};
  if (!accepted.privacy) errors.privacy = "You must accept the Privacy Policy";
  if (!accepted.terms)   errors.terms   = "You must accept the Terms & Conditions";
  if (!accepted.forum)   errors.forum   = "You must accept the Forum Policy";
  return errors;
};
export const isValid = (errors: ValidationErrors): boolean =>
  Object.keys(errors).length === 0;