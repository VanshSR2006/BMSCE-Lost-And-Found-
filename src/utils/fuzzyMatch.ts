import { Item } from "@/lib/mockData";

// Calculate Levenshtein distance between two strings
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

// Calculate similarity score (0-1, higher is more similar)
function similarityScore(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return 1 - distance / maxLength;
}

export interface MatchedItem extends Item {
  matchScore: number;
}

export function findSimilarItems(
  title: string,
  description: string,
  allItems: Item[],
  oppositeType: "lost" | "found" = "found"
): MatchedItem[] {
  
  const scoredItems = allItems
    .filter(item => item.type === oppositeType)
    .map(item => {
      const titleScore = similarityScore(title, item.title);
      const descScore = similarityScore(description, item.description);
      
      // Weighted average: title (60%), description (40%)
      const matchScore = (titleScore * 0.6) + (descScore * 0.4);
      
      return { ...item, matchScore };
    })
    .filter(item => item.matchScore >= 0.4)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);

  return scoredItems;
}
