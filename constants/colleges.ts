export interface Department {
    name: string;
    hod_name: string;
    director_name?: string; // Optional override for specific departments
}

export interface College {
    name: string;
    director_name: string; // Director or Principal
    departments: Department[];
}

export const COLLEGES: College[] = [
    {
        name: "Acropolis Institute of Management Studies and Research",
        director_name: "Dr. Rajesh Chaba",
        departments: [
            { name: "Department Of Business Administration", hod_name: "Dr. Anant Gwal" },
            { name: "Department Of Biosciences", hod_name: "Dr. Pranoti Belapurkar" },
            { name: "Department Of Computer Science", hod_name: "Dr. Smriti Jain" },
            { name: "Department Of Commerce", hod_name: "Dr. Sonali Jain" },
            { name: "Department of Humanities", hod_name: "Dr. Poonam Singh" }
        ]
    },
    {
        name: "Acropolis Faculty of Management & Research",
        director_name: "Dr. Tarun Kushwaha",
        departments: [
            { name: "Management", hod_name: "Dr. Tarun Kushwaha" }
        ]
    },
    {
        name: "Acropolis Institute of Law",
        director_name: "Dr. Geetanjali Chandra",
        departments: [
            { name: "Law", hod_name: "Dr. Geetanjali Chandra" }
        ]
    },
    {
        name: "Acropolis Institute of Pharmaceutical Education and Research",
        director_name: "Dr. G.N. Darwhekar",
        departments: [
            { name: "Pharmacy", hod_name: "Dr. G.N. Darwhekar" }
        ]
    },
    {
        name: "Acropolis Institute of Technology and Research",
        director_name: "Dr. S C SHARMA",
        departments: [
            { name: "CSE", hod_name: "Dr. Kamal K Sethi" },
            { name: "CSIT & CY", hod_name: "Dr. Shilpa Bhalerao" },
            { name: "IT & DS", hod_name: "Dr.(Prof.) Prashant Lakkadwala" },
            { name: "AIML", hod_name: "Dr. Namrata Tapaswi" },
            { name: "Civil", hod_name: "Dr. S.K. Sharma" },
            { name: "MECH", hod_name: "Dr. Hemant Marmat" },
            { name: "EC&VLSI&ACT", hod_name: "Dr. U. B. S Chandrawat" },
            { name: "FCA", hod_name: "Dr. Geeta Santhosh" },
            { name: "First Year", hod_name: "Dr. Prashant Geete" },
            {
                name: "Placement",
                hod_name: "Mr. Atul N Bharat",
                director_name: "Mr. Atul N Bharat" // Override for Placement
            }
        ]
    }
];
