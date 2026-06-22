const {
  calculateFootprint,
  getScoreColor,
  getScoreMessage,
  escapeHTML,
  storageGet,
  storageSet,
  getChallenges,
  saveChallenges,
  getScanHistory,
  saveScanResult,
  completeChallenge,
  getTotalPoints,
  getUsername,
  setUsername,
  getAchievements
} = require('../app.js');

describe('EcoVision Business Logic', () => {

  describe('calculateFootprint()', () => {
    test('Calculates zero-impact choices correctly', () => {
      const result = calculateFootprint('bike', 'vegan', 1, 'minimal');
      // Bike: 0
      // Vegan: 1.5 * 7 = 10.5
      // Energy: 1 * 0.5 * 30 = 15
      // Shopping: 0.5 * 4 = 2.0
      // Total = 0 + 10.5 + 15 + 2 = 27.5
      expect(result.footprint).toBe(27.5);
      
      // Score = 100 - (27.5 / 50) * 100 = 100 - 55 = 45
      // Max(0, Min(100, 45)) = 45
      expect(result.score).toBe(45);
      
      expect(result.breakdown).toEqual({
        transport: 0,
        food: 10.5,
        energy: 15,
        shopping: 2.0
      });
    });

    test('Calculates high-impact choices correctly', () => {
      const result = calculateFootprint('plane', 'meatHeavy', 20, 'high');
      // Plane: 6.8 * 2.5 = 17
      // Meat: 5.5 * 7 = 38.5
      // Energy: 20 * 0.5 * 30 = 300
      // Shopping: 5.0 * 4 = 20
      // Total = 17 + 38.5 + 300 + 20 = 375.5
      expect(result.footprint).toBe(375.5);
      
      // Score = 100 - (375.5 / 50) * 100 = 100 - 751 = -651 -> clamped to 0
      expect(result.score).toBe(0);
    });

    test('Uses defaults for invalid inputs', () => {
      const result = calculateFootprint('spaceship', 'alien', 10, 'magic');
      // Invalid transport -> 0
      // Invalid diet -> 3.5 * 7 = 24.5
      // Energy -> 10 * 0.5 * 30 = 150
      // Invalid shopping -> 3.0 * 4 = 12
      // Total = 0 + 24.5 + 150 + 12 = 186.5
      expect(result.footprint).toBe(186.5);
    });
  });

  describe('getScoreColor()', () => {
    test('Returns green for high scores (>= 70)', () => {
      expect(getScoreColor(100)).toBe('#4CAF50');
      expect(getScoreColor(70)).toBe('#4CAF50');
    });

    test('Returns yellow for medium scores (40-69)', () => {
      expect(getScoreColor(69)).toBe('#FFEB3B');
      expect(getScoreColor(40)).toBe('#FFEB3B');
    });

    test('Returns red for low scores (< 40)', () => {
      expect(getScoreColor(39)).toBe('#EF5350');
      expect(getScoreColor(0)).toBe('#EF5350');
    });
  });

  describe('getScoreMessage()', () => {
    test('Returns correct message based on score', () => {
      expect(getScoreMessage(85)).toContain('Excellent');
      expect(getScoreMessage(50)).toContain('Good start');
      expect(getScoreMessage(20)).toContain('Time to make some changes');
    });
  });

  describe('escapeHTML()', () => {
    test('Escapes malicious script tags', () => {
      const input = '<script>alert("xss")</script>';
      const output = escapeHTML(input);
      expect(output).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    test('Returns empty string for null/undefined', () => {
      expect(escapeHTML(null)).toBe('');
      expect(escapeHTML(undefined)).toBe('');
    });

    test('Leaves safe strings alone', () => {
      expect(escapeHTML('Safe User Name')).toBe('Safe User Name');
    });
  });

  describe('Storage & Gamification Logic', () => {
    beforeEach(() => {
      // Mock localStorage
      let store = {};
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(key => store[key] || null),
          setItem: jest.fn((key, value) => {
            store[key] = value.toString();
          }),
          removeItem: jest.fn(key => {
            delete store[key];
          }),
          clear: jest.fn(() => {
            store = {};
          })
        },
        writable: true
      });
      window.localStorage.clear();
    });

    test('storageGet and storageSet handle JSON correctly', () => {
      const data = { test: 'value' };
      storageSet('test_key', data);
      expect(window.localStorage.setItem).toHaveBeenCalledWith('test_key', JSON.stringify(data));
      
      const retrieved = storageGet('test_key');
      expect(retrieved).toEqual(data);
    });

    test('getUsername returns default if empty', () => {
      expect(getUsername()).toBe('Eco Warrior');
    });

    test('setUsername saves custom name', () => {
      setUsername('Jane Doe');
      expect(getUsername()).toBe('Jane Doe');
    });

    test('getScanHistory returns empty array by default', () => {
      expect(getScanHistory()).toEqual([]);
    });

    test('saveScanResult prepends to history', () => {
      saveScanResult({ object: 'bottle' });
      saveScanResult({ object: 'can' });
      const history = getScanHistory();
      expect(history.length).toBe(2);
      expect(history[0].object).toBe('can'); // Newest first
    });

    test('getChallenges initializes default challenges', () => {
      const challenges = getChallenges();
      expect(challenges.length).toBeGreaterThan(0);
      expect(challenges[0].id).toBe('cycle-commuter');
    });

    test('completeChallenge updates progress and adds achievement', () => {
      const updated = completeChallenge('cycle-commuter');
      const challenge = updated.find(c => c.id === 'cycle-commuter');
      expect(challenge.progress).toBe(100);

      const achievements = getAchievements();
      expect(achievements.length).toBe(1);
      expect(achievements[0].title).toBe('Cycle Commuter');
    });

    test('getTotalPoints calculates points from achievements', () => {
      completeChallenge('cycle-commuter'); // 50 pts
      completeChallenge('plastic-detox'); // 30 pts
      expect(getTotalPoints()).toBe(80);
    });
  });

});
