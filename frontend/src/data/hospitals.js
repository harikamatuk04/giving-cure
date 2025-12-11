export const HOSPITALS = [
  {
    name: "OSF Hospital",
    city: "Champaign"
  },
  {
    name: "Carle",
    city: "Champaign"
  },
  {
    name: "Northwestern",
    city: "Chicago"
  }
];

// Helper function to get city by hospital name
export const getCityByHospital = (hospitalName) => {
  const hospital = HOSPITALS.find(h => h.name === hospitalName);
  return hospital ? hospital.city : "";
};

