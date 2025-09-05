cardEffects.attack = (gameState, player, params, engine) => {
  const attackType = params[0];
  console.log(`Player executes ATTACK: ${attackType}`);
  switch(attackType) {
      case 'each_opponent_discards_card_from_hand_choice':
          console.log("Attack effect: Opponent should discard one card from their hand.");
          break;
      case 'each_opponent_gains_weakness':
          if (gameState.weaknessStack.length > 0) {
              console.log("Attack successful: Opponent gains a Weakness card.");
          } else {
              console.log("Attack failed: Weakness stack is empty.");
          }
          break;
      default:
          console.warn(`Unhandled attack type: ${attackType}`);
  }
};