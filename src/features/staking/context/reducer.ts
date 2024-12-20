import type { StakingState, ValidatorStatus } from "./state";

export type StakingAction =
  | {
      content: NonNullable<StakingState["delegations"]>;
      reset: boolean;
      type: "ADD_DELEGATIONS";
    }
  | {
      content: NonNullable<StakingState["redelegations"]>;
      reset: boolean;
      type: "ADD_REDELEGATIONS";
    }
  | {
      content: NonNullable<StakingState["unbondings"]>;
      reset: boolean;
      type: "ADD_UNBONDINGS";
    }
  | {
      content: NonNullable<StakingState["validators"]["bonded"]>;
      reset: boolean;
      status: ValidatorStatus;
      type: "ADD_VALIDATORS";
    }
  | {
      content: null;
      type: "LOGOUT";
    }
  | {
      content: StakingState["communityTax"];
      type: "SET_COMMUNITY_TAX";
    }
  | {
      content: StakingState["extraValidators"];
      type: "SET_EXTRA_VALIDATORS";
    }
  | {
      content: StakingState["inflation"];
      type: "SET_INFLATION";
    }
  | {
      content: StakingState["isInfoLoading"];
      type: "SET_IS_INFO_LOADING";
    }
  | {
      content: StakingState["modal"];
      type: "SET_MODAL";
    }
  | {
      content: StakingState["pool"];
      type: "SET_POOL";
    }
  | {
      content: StakingState["tokens"];
      type: "SET_TOKENS";
    }
  | {
      content: StakingState["validatorDetails"];
      type: "SET_VALIDATOR_DETAILS";
    };

type Content<T extends StakingAction["type"]> = Extract<
  StakingAction,
  { type: T }
>["content"];

export const setTokens = (tokens: Content<"SET_TOKENS">): StakingAction => ({
  content: tokens,
  type: "SET_TOKENS",
});

export const setIsInfoLoading = (
  isInfoLoading: Content<"SET_IS_INFO_LOADING">,
): StakingAction => ({
  content: isInfoLoading,
  type: "SET_IS_INFO_LOADING",
});

export const setValidators = (
  validators: Content<"ADD_VALIDATORS">,
  reset: boolean,
  status: ValidatorStatus,
): StakingAction => ({
  content: validators,
  reset,
  status,
  type: "ADD_VALIDATORS",
});

export const addDelegations = (
  delegations: Content<"ADD_DELEGATIONS">,
  reset: boolean,
): StakingAction => ({
  content: delegations,
  reset,
  type: "ADD_DELEGATIONS",
});

export const addUnbondings = (
  unbondings: Content<"ADD_UNBONDINGS">,
  reset: boolean,
): StakingAction => ({
  content: unbondings,
  reset,
  type: "ADD_UNBONDINGS",
});

export const addRedelegations = (
  redelegation: Content<"ADD_REDELEGATIONS">,
  reset: boolean,
): StakingAction => ({
  content: redelegation,
  reset,
  type: "ADD_REDELEGATIONS",
});

export const setValidatorDetails = (
  content: Content<"SET_VALIDATOR_DETAILS">,
): StakingAction => ({
  content,
  type: "SET_VALIDATOR_DETAILS",
});

export const setPool = (content: Content<"SET_POOL">): StakingAction => ({
  content,
  type: "SET_POOL",
});

export const logout = (): StakingAction => ({
  content: null,
  type: "LOGOUT",
});

export const setModalOpened = (
  content: Content<"SET_MODAL">,
): StakingAction => ({
  content,
  type: "SET_MODAL",
});

export const setCommunityTax = (
  content: Content<"SET_COMMUNITY_TAX">,
): StakingAction => ({
  content,
  type: "SET_COMMUNITY_TAX",
});

export const setInflation = (
  content: Content<"SET_INFLATION">,
): StakingAction => ({
  content,
  type: "SET_INFLATION",
});

export const setExtraValidators = (
  content: Content<"SET_EXTRA_VALIDATORS">,
): StakingAction => ({
  content,
  type: "SET_EXTRA_VALIDATORS",
});

// Used for pagination
const getUniqueValidators = (
  validators: NonNullable<StakingState["validators"]["bonded"]>["items"],
) => {
  const validatorIds = new Set<string>();

  return validators.filter((validator) => {
    if (validatorIds.has(validator.operatorAddress)) {
      return false;
    }

    validatorIds.add(validator.operatorAddress);

    return true;
  });
};

const getUniqueDelegations = (
  delegations: NonNullable<StakingState["delegations"]>["items"],
) => {
  const validatorIds = new Set<string>();

  return delegations.filter((delegation) => {
    if (validatorIds.has(delegation.validatorAddress)) {
      return false;
    }

    validatorIds.add(delegation.validatorAddress);

    return true;
  });
};

const getUniqueUnbondings = (
  unbondings: NonNullable<StakingState["unbondings"]>["items"],
) => {
  const validatorIds = new Set<string>();

  return unbondings.filter((unbonding) => {
    const key = unbonding.id;

    if (validatorIds.has(key)) {
      return false;
    }

    validatorIds.add(key);

    return true;
  });
};

const getUniqueRedelegations = (
  redelegations: NonNullable<StakingState["redelegations"]>["items"],
) => {
  const validatorIds = new Set<string>();

  return redelegations.filter((redelegation) => {
    const key = redelegation.id;

    if (validatorIds.has(key)) {
      return false;
    }

    validatorIds.add(key);

    return true;
  });
};

export const reducer = (
  state: StakingState,
  action: StakingAction,
): StakingState => {
  switch (action.type) {
    case "SET_TOKENS":
      return { ...state, tokens: action.content };

    case "ADD_VALIDATORS": {
      const currentValidators = (!action.reset &&
        state.validators[action.status]) || {
        items: [],
        nextKey: null,
        total: null,
      };

      currentValidators.total = action.content.total;
      currentValidators.nextKey = action.content.nextKey;

      currentValidators.items = getUniqueValidators(
        currentValidators.items.concat(action.content.items),
      );

      return {
        ...state,
        validators: {
          ...state.validators,
          [action.status]: currentValidators,
        },
      };
    }

    case "ADD_DELEGATIONS": {
      const currentDelegations = (!action.reset && state.delegations) || {
        items: [],
        nextKey: null,
        total: null,
      };

      currentDelegations.total = action.content.total;
      currentDelegations.nextKey = action.content.nextKey;

      currentDelegations.items = getUniqueDelegations(
        action.content.items.concat(currentDelegations.items),
      );

      return {
        ...state,
        delegations: currentDelegations,
      };
    }

    case "ADD_UNBONDINGS": {
      const currentUnbondings = (!action.reset && state.unbondings) || {
        items: [],
        nextKey: null,
        total: null,
      };

      currentUnbondings.total = action.content.total;
      currentUnbondings.nextKey = action.content.nextKey;

      currentUnbondings.items = getUniqueUnbondings(
        action.content.items.concat(currentUnbondings.items),
      );

      return {
        ...state,
        unbondings: currentUnbondings,
      };
    }

    case "ADD_REDELEGATIONS": {
      const currentRedelegations = (!action.reset && state.redelegations) || {
        items: [],
        nextKey: null,
        total: null,
      };

      currentRedelegations.total = action.content.total;
      currentRedelegations.nextKey = action.content.nextKey;

      currentRedelegations.items = getUniqueRedelegations(
        action.content.items.concat(currentRedelegations.items),
      );

      return {
        ...state,
        redelegations: currentRedelegations,
      };
    }

    case "SET_IS_INFO_LOADING": {
      return {
        ...state,
        isInfoLoading: action.content,
      };
    }

    case "SET_VALIDATOR_DETAILS": {
      return {
        ...state,
        validatorDetails: action.content,
      };
    }

    case "SET_POOL": {
      return {
        ...state,
        pool: action.content,
      };
    }

    case "SET_MODAL": {
      return {
        ...state,
        modal: action.content,
      };
    }

    case "LOGOUT": {
      return {
        ...state,
        delegations: null,
        unbondings: null,
      };
    }

    case "SET_EXTRA_VALIDATORS": {
      return {
        ...state,
        extraValidators: action.content,
      };
    }

    case "SET_INFLATION": {
      return {
        ...state,
        inflation: action.content,
      };
    }

    case "SET_COMMUNITY_TAX": {
      return {
        ...state,
        communityTax: action.content,
      };
    }

    default:
      action satisfies never;

      return state;
  }
};
