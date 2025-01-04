import React from "react";
import "./tournamentForm.css";

const TournamentForm = ({ setAddTournament, setPlayers }) => {
    function handleSubmit(e) {
        e.preventDefault();
        // const { firstName, secondName, thirdName, fourthName } = players;
      }
    
      const handleChange = (e) => {
        const { name, value } = e.target;
        setPlayers((prev) => ({
          ...prev,
          [name]: value,
        }));
      };
  return (
    <div className="AddTournament-formatContainer">
      <form className="AddTournament-form" onSubmit={handleSubmit}>
        <div id="AddTournament-cancel" onClick={() => setAddTournament(false)}>
          cancel
        </div>
        <div className="input-container">
          <h1 className="AddTournamament-formheader">Local Tournament</h1>
          <div>
            <label>First Player:</label>
            <input
              type="text"
              id="fname"
              name="firstName"
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Second Player:</label>
            <input
              type="text"
              id="sname"
              name="secondName"
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Third Player:</label>
            <input
              type="text"
              id="tname"
              name="thirdName"
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Fourth Player:</label>
            <input
              type="text"
              id="foname"
              name="fourthName"
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="submitTournament">
          <div className="bgcolor"></div>
          <input type="submit" value="Play" id="AddTournament-submit" />
        </div>
      </form>
    </div>
  );
};

export default TournamentForm;
