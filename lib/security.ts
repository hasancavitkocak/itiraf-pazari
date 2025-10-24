import CryptoJS from 'crypto-js';

export function getIpHash(ip: string, userAgent: string): string {
  const combined = `${ip}:${userAgent}`;
  return CryptoJS.SHA256(combined).toString();
}

export async function checkBadWords(content: string): Promise<boolean> {
  const { data: badWords } = await fetch('/api/bad-words').then(res => res.json());

  if (!badWords || badWords.length === 0) return false;

  const lowerContent = content.toLowerCase();

  return badWords.some((word: string) => {
    const lowerWord = word.toLowerCase();
    return lowerContent.includes(lowerWord);
  });
}
