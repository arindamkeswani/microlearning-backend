import * as randomstring from 'randomstring';
const capitalLetters="ABCDEFGHIJKLMNOPQURSTUVWXYZ"
export class CommonFunctions{
    async getRandomRating() {
      // Generate a random number between 30 and 50 (inclusive).
      const randomNumber = Math.random() * (5 - 3) + 3;
      
      // Round the number to one decimal place.
      const roundedNumber = Math.round(randomNumber * 10) / 10;
    
      return roundedNumber;
    }
}