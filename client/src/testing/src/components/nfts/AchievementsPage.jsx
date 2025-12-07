import React from "react";
import "../../styles/Achievements.css";

const AchievementsPage = () => {
  const achievements = [
    { id: 1, title: "First NFT Minted", description: "Congratulations on minting your first NFT!" },
    { id: 2, title: "Collector Level 1", description: "You have collected your first 5 NFTs!" },
    { id: 3, title: "Community Contributor", description: "You have contributed to the community by sharing your NFTs!" },
    // Add more achievements as needed
  ];

  return (
    <div className="achievements-page">
      <h1>Your Achievements</h1>
      <div className="achievements-list">
        {achievements.map((achievement) => (
          <div key={achievement.id} className="achievement-card">
            <h2>{achievement.title}</h2>
            <p>{achievement.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsPage;