export const MAX_TEAMS_PER_GROUP = 25;
export const MAX_TOTAL_TEAMS = 1000;

export interface GroupDistribution {
  index: number;
  name: string;
  code: string;
  size: number;
}

export const groupCode = (index: number): string => {
  let value = index + 1;
  let code = '';
  while (value > 0) {
    value -= 1;
    code = String.fromCharCode(65 + (value % 26)) + code;
    value = Math.floor(value / 26);
  }
  return code;
};

export const groupId = (index: number): string => `grp_${groupCode(index).toLowerCase()}`;

export const getGroupOptions = (groupNames: string[] = ['Group A', 'Group B']) =>
  groupNames.map((name, index) => ({ id: groupId(index), name }));

export const getGroupDistribution = (totalTeams: number): GroupDistribution[] => {
  if (!Number.isInteger(totalTeams) || totalTeams < 1) return [];

  const groupCount = Math.ceil(totalTeams / MAX_TEAMS_PER_GROUP);
  const baseSize = Math.floor(totalTeams / groupCount);
  const remainder = totalTeams % groupCount;

  return Array.from({ length: groupCount }, (_, index) => {
    const code = groupCode(index);
    return {
      index,
      name: `Group ${code}`,
      code,
      size: baseSize + (index < remainder ? 1 : 0)
    };
  });
};