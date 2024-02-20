export enum GameState {
	START,
	PROGRESS,
	FINISH
}

export type GetPointsResponse = {
	uid: number | null;
	points: number | null;
};

export type CreateInstanceResponse = {
	iid: number;
};

export type UpdateInstanceResponse = {
	iid: number;
};
