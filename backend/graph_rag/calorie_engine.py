"""
Calorie Engine based on National Dietary Guidelines (NDG) 2025.
Calculates Ideal Body Weight (IBW) and Daily Calorie Allowance (DCA).
"""

def calculate_targets(profile: dict) -> dict:
    """
    Feature: User target setup.
    Profile should contain: gender ('male'/'female'), height_cm, weight_kg, activity_level
    Activity levels: 'sedentary', 'moderate', 'active'
    """
    height_cm = profile.get('height_cm', 160)
    weight_kg = profile.get('weight_kg', 60)
    gender = profile.get('gender', 'male').lower()
    activity = profile.get('activity_level', 'sedentary').lower()
    
    # NDG 2025 BMI
    bmi = weight_kg / ((height_cm / 100) ** 2)
    body_type = 'normal'
    # Using South Asian cutoffs as suggested in NDG
    if bmi >= 27.5: body_type = 'obese'
    elif bmi >= 23.0: body_type = 'overweight'
    elif bmi < 18.5: body_type = 'underweight'

    # NDG 2025 IBW Formula (Devine Formula adapted)
    h_inches = height_cm / 2.54
    if gender == 'male':
        ibw = 50 + 2.3 * (h_inches - 60)
    else:
        ibw = 45.5 + 2.3 * (h_inches - 60)
        
    # Prevent negative adjustments for very short people
    if h_inches < 60:
        ibw = weight_kg # fallback
        
    # Calorie factor table based on NDG 2025 guidelines
    cf_table = {
        'obese':       {'sedentary': 20, 'moderate': 25, 'active': 30},
        'overweight':  {'sedentary': 25, 'moderate': 30, 'active': 35},
        'normal':      {'sedentary': 30, 'moderate': 35, 'active': 40},
        'underweight': {'sedentary': 35, 'moderate': 40, 'active': 45},
    }
    
    cf = cf_table.get(body_type, cf_table['normal']).get(activity, 30)
    
    # Daily Calorie Allowance (DCA)
    target_calories = ibw * cf
    
    return {
        'bmi': round(bmi, 1),
        'body_type': body_type,
        'ideal_body_weight_kg': round(ibw, 1),
        'target_calories': round(target_calories),
        'protein_g': round((target_calories * 0.15) / 4),  # 15% from protein
        'fat_g': round((target_calories * 0.30) / 9),      # 30% from fat
        'carbs_g': round((target_calories * 0.55) / 4),    # 55% from carbs
        'water_L': round(ibw * 0.033, 1)                   # ~33ml per kg
    }
