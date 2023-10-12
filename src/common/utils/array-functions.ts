import { Injectable } from '@nestjs/common';

@Injectable()
export class ArrayService {
  getRandomSubarray(arr: any[], length: number): any[] {
    if (length <= 0 ) {
      throw new Error('Invalid subarray length');
    }

    const shuffled = arr.slice(); // Clone the array
    let currentIndex = arr.length;
    let temporaryValue;
    let randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      temporaryValue = shuffled[currentIndex];
      shuffled[currentIndex] = shuffled[randomIndex];
      shuffled[randomIndex] = temporaryValue;
    }
    return shuffled.slice(0, length);
  }

  filterUniqueObjectsArrray(objects: any[]): any[] {
    const uniqueObjects = Array.from(
      new Set(objects.map(obj => obj._id.toString()))
    ).map(id => {
      return objects.find(obj => obj._id.toString() === id);
    });

    return uniqueObjects;
  }
}
