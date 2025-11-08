export const avatarOptions = {
  skinTone: ['#FFDAB9', '#F0C49A', '#D4A574', '#C08858', '#8D5524', '#5C3317'],
  hairStyle: ['short', 'long', 'curly', 'bald', 'ponytail'],
  hairColor: ['#2C1B18', '#6A4E42', '#B55239', '#E7C566', '#EFEFEF'],
  eyes: ['happy', 'neutral', 'excited', 'sleepy'],
  mouth: ['smile', 'neutral', 'grin', 'laugh'],
  clothing: ['tshirt', 'hoodie', 'formal', 'casual'],
  clothingColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
};

export const defaultAvatarConfig = {
  skinTone: avatarOptions.skinTone[0],
  hairStyle: avatarOptions.hairStyle[0],
  hairColor: avatarOptions.hairColor[0],
  eyes: avatarOptions.eyes[0],
  mouth: avatarOptions.mouth[0],
  clothing: avatarOptions.clothing[0],
  clothingColor: avatarOptions.clothingColor[0]
};