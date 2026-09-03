
export type StaticQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export const STATIC_QUESTIONS: Record<string, StaticQuestion[]> = {
  "Clinical Chemistry": [
    {
      question: "Which of the following is the primary storage form of glucose in the liver?",
      options: ["Glucagon", "Glycogen", "Starch", "Cellulose"],
      correctAnswer: "B",
      explanation: "Glycogen is a multibranched polysaccharide of glucose that serves as a form of energy storage in animals, fungi, and bacteria."
    },
    {
      question: "In the Jaffe reaction, creatinine reacts with which reagent to form an orange-red complex?",
      options: ["Alkaline picrate", "Sodium hydroxide", "Phosphomolybdic acid", "Copper sulfate"],
      correctAnswer: "A",
      explanation: "The Jaffe reaction is a colorimetric method used in clinical chemistry to determine creatinine levels in blood and urine."
    }
  ],
  "Hematology": [
    {
      question: "What is the normal range for hemoglobin in adult males?",
      options: ["12-16 g/dL", "13.5-17.5 g/dL", "10-14 g/dL", "15-20 g/dL"],
      correctAnswer: "B",
      explanation: "Adult male normal range is typically 13.5 to 17.5 g/dL, whereas females are lower (12.0 to 15.5 g/dL)."
    },
    {
      question: "Which cell is the first recognizable stage of the granulocytic series?",
      options: ["Myeloblast", "Promyelocyte", "Myelocyte", "Metamyelocyte"],
      correctAnswer: "A",
      explanation: "The myeloblast is the earliest identifiable cell of the granulocyte series in the bone marrow."
    }
  ],
  "Microbiology": [
    {
      question: "Which of the following is a Gram-positive cocci arranged in clusters?",
      options: ["Streptococcus", "Staphylococcus", "Neisseria", "Bacillus"],
      correctAnswer: "B",
      explanation: "Staphylococci are characterized by their grape-like cluster arrangement under the microscope."
    }
  ],
  "Immunology & Serology and Immunohematology": [
    {
      question: "Which blood group is known as the universal donor for Red Blood Cells?",
      options: ["Group A", "Group B", "Group AB", "Group O"],
      correctAnswer: "D",
      explanation: "Group O negative blood is often called the universal donor because it lacks A, B, and Rh antigens."
    }
  ],
  "Clinical Microscopy & Parasitology": [
    {
      question: "What type of cast is usually associated with chronic renal failure?",
      options: ["Hyaline cast", "Waxy cast", "Granular cast", "RBC cast"],
      correctAnswer: "B",
      explanation: "Waxy casts are associated with severe chronic renal disease and renal amyloidosis."
    }
  ],
  "Histopathology & MT Laws": [
    {
      question: "What is the primary law regulating the practice of Medical Technology in the Philippines?",
      options: ["RA 5527", "RA 4688", "RA 7722", "RA 9165"],
      correctAnswer: "A",
      explanation: "RA 5527, also known as the Philippine Medical Technology Act of 1969, is the principal law governing the profession."
    }
  ]
};
