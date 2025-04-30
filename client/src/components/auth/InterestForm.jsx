import { useState, useEffect } from "react";
import "./interests.scss";

const InterestsForm = ({ initialSelections = {}, onSubmit, loading }) => {
  const [inputs, setInputs] = useState({});
  const [selections, setSelections] = useState({});

  useEffect(() => {
    setSelections(initialSelections);
    setInputs(Object.fromEntries(Object.keys(initialSelections).map(k => [k, ""])));
  }, [initialSelections]);

  const categories = [
    { id: "music", label: "Music Artists", placeholder: "e.g., The Weeknd, Taylor Swift" },
    { id: "movies", label: "Movies", placeholder: "e.g., Inception, The Dark Knight" },
    { id: "comicsAnime", label: "Comics & Anime", placeholder: "e.g., Attack on Titan, Marvel Comics" },
    { id: "artStyle", label: "Art Style", placeholder: "e.g., Minimalist, Pop Art" },
    { id: "spendingHabits", label: "Spending Habits", placeholder: "e.g., Luxury, Budget-conscious" },
    { id: "activities", label: "Activities", placeholder: "e.g., Gym, Gaming" },
  ];

  const handleInputChange = (e, category) => {
    setInputs({ ...inputs, [category]: e.target.value });
  };

  const handleAddInterest = (category) => {
    if (inputs[category].trim() === "" || selections[category]?.length >= 5) return;
    setSelections({
      ...selections,
      [category]: [...(selections[category] || []), inputs[category].trim()],
    });
    setInputs({ ...inputs, [category]: "" });
  };

  const handleRemoveInterest = (category, index) => {
    const updated = selections[category].filter((_, i) => i !== index);
    setSelections({ ...selections, [category]: updated });
  };

  const handleSave = () => {
    const allInterests = Object.values(selections).flat();
    onSubmit(allInterests);
  };

  return (
    <div className="interests-container">
      <div className="interests-card">
        <h1 className="interests-title">Update Your Interests</h1>
        <p className="interests-subtitle">Up to 5 per category</p>

        {categories.map(({ id, label, placeholder }) => (
          <div key={id} className="category-container">
            <h3 className="category-title">{label}</h3>
            <div className="input-container">
              <input
                type="text"
                value={inputs[id]}
                onChange={(e) => handleInputChange(e, id)}
                placeholder={placeholder}
                className="interest-input"
              />
              <button
                onClick={() => handleAddInterest(id)}
                disabled={selections[id]?.length >= 5}
                className={`add-button ${selections[id]?.length >= 5 ? "disabled" : ""}`}
              >
                Add
              </button>
            </div>
            <div className="tags-container">
              {selections[id]?.map((item, index) => (
                <div key={index} className="tag">
                  {item}
                  <button onClick={() => handleRemoveInterest(id, index)} className="remove-button">
                    ×
                  </button>
                </div>
              ))}
            </div>
            {selections[id]?.length >= 5 && (
              <p className="max-limit-message">Maximum 5 items reached</p>
            )}
          </div>
        ))}

        <button onClick={handleSave} disabled={loading} className="save-button">
          {loading ? "Saving..." : "Save Interests"}
        </button>
      </div>
    </div>
  );
};

export default InterestsForm;
