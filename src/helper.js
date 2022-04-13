// this must to return the first 10 scores saved
export const firstTenPlayers = () => {
  let scores = getScores();
  return scores.sort((a, b) => a.score - b.score).reverse().slice(0, 10);
};

// must to set the new score
export const setScore = (playerName, score) => {
  // Tests if we already have some score into local
  let player = {playerName: playerName.trim(), score};

  if (localStorage.getItem('scores') === null) {
    localStorage.setItem('scores', JSON.stringify([player]));
  } else {
    localStorage.setItem(
      'scores',
      JSON.stringify([
        ...getScores(),
        player,
      ])
    );
  }
};

//this must to reload all scores that are saved into localStorage and parse to JSON
const getScores = () => {
  if(localStorage.length<1) {
    return [];
  }
  return JSON.parse(localStorage.getItem("scores"));
};

// this must to remove all scores from location and reload the window
export const removeScores = () => {
  localStorage.clear();
  return window.location.reload();
};