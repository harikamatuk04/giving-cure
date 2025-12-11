export const HOSPITALS = [
  {
    name: "OSF",
    city: "Champaign"
  },
  {
    name: "Carle",
    city: "Champaign"
  },
  {
    name: "Rush University Medical Center" ,
    city: "Chicago"
  }
];

// Helper function to get city by hospital name
export const getCityByHospital = (hospitalName) => {
  const hospital = HOSPITALS.find(h => h.name === hospitalName);
  return hospital ? hospital.city : "";
};

