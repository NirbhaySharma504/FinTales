// NFT data with XP requirements for each NFT
const nftData = [
    {
      id: 1,
      title: "Budget Basics",
      description: "Learned what a budget is and why it matters for financial health.",
      xpRequired: 100,
      imageSrc: "/assets/nfts/1.jpg",
      metadata: {
        name: "Budget Basics",
        description: "Financial literacy achievement for understanding the concept and importance of budgeting.",
        attributes: [
          { trait_type: "Category", value: "Budgeting" },
          { trait_type: "Level", value: "Beginner" },
          { trait_type: "XP Required", value: "100" }
        ]
      }
      },
      {
      id: 2,
      title: "First Budget Creator",
      description: "Built your very first simple budget using real-world numbers.",
      xpRequired: 120,
      imageSrc: "/assets/nfts/2.jpg",
      metadata: {
        name: "First Budget Creator",
        description: "Achievement for building your first basic budget.",
        attributes: [
          { trait_type: "Category", value: "Budgeting" },
          { trait_type: "Level", value: "Beginner" },
          { trait_type: "XP Required", value: "120" }
        ]
      }
      },
      {
      id: 3,
      title: "Budgeting Strategist",
      description: "Learned about 50/30/20 rule and zero-based budgeting methods.",
      xpRequired: 140,
      imageSrc: "/assets/nfts/3.jpg",
      metadata: {
        name: "Budgeting Strategist",
        description: "Achievement for mastering popular budgeting techniques.",
        attributes: [
          { trait_type: "Category", value: "Budgeting" },
          { trait_type: "Level", value: "Intermediate" },
          { trait_type: "XP Required", value: "140" }
        ]
      }
      },
      {
      id: 4,
      title: "Adaptive Budgeter",
      description: "Learned how to adjust budgets for emergencies and unexpected expenses.",
      xpRequired: 160,
      imageSrc: "/assets/nfts/4.jpg",
      metadata: {
        name: "Adaptive Budgeter",
        description: "Achievement for adapting financial plans to unexpected costs.",
        attributes: [
          { trait_type: "Category", value: "Budgeting" },
          { trait_type: "Level", value: "Intermediate" },
          { trait_type: "XP Required", value: "160" }
        ]
      }
      },
      {
      id: 5,
      title: "Smart Budgeter",
      description: "Discovered tools and apps that make budgeting easier and smarter.",
      xpRequired: 180,
      imageSrc: "/assets/nfts/5.jpg",
      metadata: {
        name: "Smart Budgeter",
        description: "Achievement for learning to use budgeting tools effectively.",
        attributes: [
          { trait_type: "Category", value: "Budgeting" },
          { trait_type: "Level", value: "Intermediate" },
          { trait_type: "XP Required", value: "180" }
        ]
      }
      },
      {
      id: 6,
      title: "Savings Starter",
      description: "Understood why saving matters and the role of emergency funds.",
      xpRequired: 200,
      imageSrc: "/assets/nfts/6.jpg",
      metadata: {
        name: "Savings Starter",
        description: "Achievement for understanding emergency funds and savings importance.",
        attributes: [
          { trait_type: "Category", value: "Saving" },
          { trait_type: "Level", value: "Beginner" },
          { trait_type: "XP Required", value: "200" }
        ]
      }
      },
      {
      id: 7,
      title: "Savings Planner",
      description: "Set up short-term, medium-term, and long-term savings goals.",
      xpRequired: 220,
      imageSrc: "/assets/nfts/7.jpg",
      metadata: {
        name: "Savings Planner",
        description: "Achievement for setting financial goals across different time horizons.",
        attributes: [
          { trait_type: "Category", value: "Saving" },
          { trait_type: "Level", value: "Intermediate" },
          { trait_type: "XP Required", value: "220" }
        ]
      }
      },
      {
      id: 8,
      title: "Savings Strategist",
      description: "Explored various saving instruments like savings accounts, FDs, and RDs.",
      xpRequired: 240,
      imageSrc: "/assets/nfts/8.jpg",
      metadata: {
        name: "Savings Strategist",
        description: "Achievement for learning different saving options and vehicles.",
        attributes: [
          { trait_type: "Category", value: "Saving" },
          { trait_type: "Level", value: "Intermediate" },
          { trait_type: "XP Required", value: "240" }
        ]
      }
      },
      {
      id: 9,
      title: "Compound Wizard",
      description: "Learned the magic of starting early and the power of compound interest.",
      xpRequired: 260,
      imageSrc: "/assets/nfts/9.jpg",
      metadata: {
        name: "Compound Wizard",
        description: "Achievement for understanding how compound interest grows wealth.",
        attributes: [
          { trait_type: "Category", value: "Saving" },
          { trait_type: "Level", value: "Intermediate" },
          { trait_type: "XP Required", value: "260" }
        ]
      }
      },
      {
      id: 10,
      title: "Credit Explorer",
      description: "Discovered what credit is and why it matters.",
      xpRequired: 280,
      imageSrc: "/assets/nfts/10.jpg",
      metadata: {
        name: "Credit Explorer",
        description: "Achievement for understanding the basics of credit.",
        attributes: [
          { trait_type: "Category", value: "Credit" },
          { trait_type: "Level", value: "Beginner" },
          { trait_type: "XP Required", value: "280" }
        ]
      }
      },
      {
        id: 11,
        title: "Credit Score Starter",
        description: "Learned what a credit score is and why it's important.",
        xpRequired: 300,
        imageSrc: "/assets/nfts/11.jpg",
        metadata: {
          name: "Credit Score Starter",
          description: "Achievement for understanding the basics of credit scores.",
          attributes: [
            { trait_type: "Category", value: "Credit" },
            { trait_type: "Level", value: "Beginner" },
            { trait_type: "XP Required", value: "300" }
          ]
        }
        },
        {
        id: 12,
        title: "Credit Influencer",
        description: "Discovered the factors that affect your credit score.",
        xpRequired: 320,
        imageSrc: "/assets/nfts/12.jpg",
        metadata: {
          name: "Credit Influencer",
          description: "Achievement for mastering what impacts your credit score.",
          attributes: [
            { trait_type: "Category", value: "Credit" },
            { trait_type: "Level", value: "Intermediate" },
            { trait_type: "XP Required", value: "320" }
          ]
        }
        },
        {
        id: 13,
        title: "Credit Repairer",
        description: "Learned how to repair and improve a bad credit score.",
        xpRequired: 340,
        imageSrc: "/assets/nfts/13.jpg",
        metadata: {
          name: "Credit Repairer",
          description: "Achievement for learning how to fix and boost credit scores.",
          attributes: [
            { trait_type: "Category", value: "Credit" },
            { trait_type: "Level", value: "Intermediate" },
            { trait_type: "XP Required", value: "340" }
          ]
        }
        },
        {
        id: 14,
        title: "Debt Defender",
        description: "Learned how to avoid debt traps and manage borrowing smartly.",
        xpRequired: 360,
        imageSrc: "/assets/nfts/14.jpg",
        metadata: {
          name: "Debt Defender",
          description: "Achievement for understanding and avoiding common debt traps.",
          attributes: [
            { trait_type: "Category", value: "Credit" },
            { trait_type: "Level", value: "Intermediate" },
            { trait_type: "XP Required", value: "360" }
          ]
        }
        },
        {
        id: 15,
        title: "Investment Beginner",
        description: "Understood what investing is and why it matters.",
        xpRequired: 380,
        imageSrc: "/assets/nfts/15.jpg",
        metadata: {
          name: "Investment Beginner",
          description: "Achievement for understanding investment fundamentals.",
          attributes: [
            { trait_type: "Category", value: "Investing" },
            { trait_type: "Level", value: "Beginner" },
            { trait_type: "XP Required", value: "380" }
          ]
        }
        },
        {
        id: 16,
        title: "Investment Explorer",
        description: "Learned about basic investment options: stocks, bonds, mutual funds, etc.",
        xpRequired: 400,
        imageSrc: "/assets/nfts/16.jpg",
        metadata: {
          name: "Investment Explorer",
          description: "Achievement for exploring different investment options.",
          attributes: [
            { trait_type: "Category", value: "Investing" },
            { trait_type: "Level", value: "Beginner" },
            { trait_type: "XP Required", value: "400" }
          ]
        }
        },
        {
        id: 17,
        title: "Risk Manager",
        description: "Understood the relationship between risk and reward in investments.",
        xpRequired: 420,
        imageSrc: "/assets/nfts/17.jpg",
        metadata: {
          name: "Risk Manager",
          description: "Achievement for understanding investment risks and rewards.",
          attributes: [
            { trait_type: "Category", value: "Investing" },
            { trait_type: "Level", value: "Intermediate" },
            { trait_type: "XP Required", value: "420" }
          ]
        }
        },
        {
        id: 18,
        title: "Compound Investor",
        description: "Mastered the magic of compounding in growing wealth.",
        xpRequired: 440,
        imageSrc: "/assets/nfts/18.jpg",
        metadata: {
          name: "Compound Investor",
          description: "Achievement for mastering compound interest in investments.",
          attributes: [
            { trait_type: "Category", value: "Investing" },
            { trait_type: "Level", value: "Intermediate" },
            { trait_type: "XP Required", value: "440" }
          ]
        }
        },
        {
        id: 19,
        title: "Young Investor",
        description: "Learned how to start investing young using SIPs, robo-advisors, and stock apps.",
        xpRequired: 460,
        imageSrc: "/assets/nfts/19.jpg",
        metadata: {
          name: "Young Investor",
          description: "Achievement for learning beginner-friendly ways to start investing early.",
          attributes: [
            { trait_type: "Category", value: "Investing" },
            { trait_type: "Level", value: "Intermediate" },
            { trait_type: "XP Required", value: "460" }
          ]
        }
        },
        {
        id: 20,
        title: "Tax Explorer",
        description: "Learned why we pay taxes and their role in society.",
        xpRequired: 480,
        imageSrc: "/assets/nfts/20.jpg",
        metadata: {
          name: "Tax Explorer",
          description: "Achievement for understanding the purpose of taxes.",
          attributes: [
            { trait_type: "Category", value: "Taxes" },
            { trait_type: "Level", value: "Beginner" },
            { trait_type: "XP Required", value: "480" }
          ]
        }
        },
        {
        id: 21,
        title: "Income Tax Learner",
        description: "Learned basics of income tax and tax slabs.",
        xpRequired: 500,
        imageSrc: "/assets/nfts/21.jpg",
        metadata: {
          name: "Income Tax Learner",
          description: "Achievement for understanding how income tax works.",
          attributes: [
            { trait_type: "Category", value: "Taxes" },
            { trait_type: "Level", value: "Beginner" },
            { trait_type: "XP Required", value: "500" }
          ]
        }
        },
        {
        id: 22,
        title: "ITR Filer",
        description: "Learned how to file Income Tax Returns (ITR) step-by-step.",
        xpRequired: 520,
        imageSrc: "/assets/nfts/22.jpg",
        metadata: {
          name: "ITR Filer",
          description: "Achievement for learning to file income tax returns independently.",
          attributes: [
            { trait_type: "Category", value: "Taxes" },
            { trait_type: "Level", value: "Intermediate" },
            { trait_type: "XP Required", value: "520" }
          ]
        }
        },
        {
        id: 23,
        title: "GST Navigator",
        description: "Understood GST and its impact on everyday purchases.",
        xpRequired: 540,
        imageSrc: "/assets/nfts/23.jpg",
        metadata: {
          name: "GST Navigator",
          description: "Achievement for understanding GST basics in daily life.",
          attributes: [
            { trait_type: "Category", value: "Taxes" },
            { trait_type: "Level", value: "Intermediate" },
            { trait_type: "XP Required", value: "540" }
          ]
        }
        },
        {
        id: 24,
        title: "Tax Saver",
        description: "Learned legal ways to save on taxes through deductions and planning.",
        xpRequired: 560,
        imageSrc: "/assets/nfts/24.jpg",
        metadata: {
          name: "Tax Saver",
          description: "Achievement for mastering legal tax-saving techniques.",
          attributes: [
            { trait_type: "Category", value: "Taxes" },
            { trait_type: "Level", value: "Intermediate" },
            { trait_type: "XP Required", value: "560" }
          ]
        }
        },
        {
        id: 25,
        title: "Debt Beginner",
        description: "Understood the basics of borrowing money and types of debt.",
        xpRequired: 580,
        imageSrc: "/assets/nfts/25.jpg",
        metadata: {
          name: "Debt Beginner",
          description: "Achievement for understanding the fundamentals of debt.",
          attributes: [
            { trait_type: "Category", value: "Borrowing" },
            { trait_type: "Level", value: "Beginner" },
            { trait_type: "XP Required", value: "580" }
          ]
        }
        },
        {
        id: 26,
        title: "Debt Classifier",
        description: "Learned the difference between good debt and bad debt (student loans, credit cards, car loans).",
        xpRequired: 600,
        imageSrc: "/assets/nfts/26.jpg",
        metadata: {
          name: "Debt Classifier",
          description: "Achievement for differentiating good and bad types of debt.",
          attributes: [
            { trait_type: "Category", value: "Borrowing" },
            { trait_type: "Level", value: "Intermediate" },
            { trait_type: "XP Required", value: "600" }
          ]
        }
        },
        {
        id: 27,
        title: "Interest Analyzer",
        description: "Learned how interest works and impacts borrowing.",
        xpRequired: 620,
        imageSrc: "/assets/nfts/27.jpg",
        metadata: {
          name: "Interest Analyzer",
          description: "Achievement for understanding how interest affects debt repayment.",
          attributes: [
            { trait_type: "Category", value: "Borrowing" },
            { trait_type: "Level", value: "Intermediate" },
            { trait_type: "XP Required", value: "620" }
          ]
        }
        },
        {
        id: 28,
        title: "Smart Borrower",
        description: "Mastered how to borrow smartly by understanding terms before taking a loan.",
        xpRequired: 640,
        imageSrc: "/assets/nfts/28.jpg",
        metadata: {
          name: "Smart Borrower",
          description: "Achievement for learning responsible borrowing practices.",
          attributes: [
            { trait_type: "Category", value: "Borrowing" },
            { trait_type: "Level", value: "Intermediate" },
            { trait_type: "XP Required", value: "640" }
          ]
        }
        },      
    ];
    
    module.exports = nftData;
    