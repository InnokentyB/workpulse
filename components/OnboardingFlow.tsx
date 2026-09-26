import { useState } from "react";

import type {
  BreakSpace,
  OnboardingAnswers,
  PreferredActivityFormat,
  Workplace,
  WorkplaceVisibility,
} from "@/lib/activity-preferences";

type OnboardingFlowProps = {
  initialAnswers?: OnboardingAnswers | null;
  onComplete: (answers: OnboardingAnswers) => void;
  onSkip: () => void;
};

const DEFAULT_ANSWERS: OnboardingAnswers = {
  workplace: "home",
  visibility: "private",
  breakSpace: "desk-only",
  hasDistantView: false,
  preferredFormats: [],
  avoidJumpsOrFloor: false,
};

const PLACE_OPTIONS: readonly { value: Workplace; label: string }[] = [
  { value: "home", label: "At home" },
  { value: "office", label: "In an office" },
  { value: "other", label: "Somewhere else" },
];
const VISIBILITY_OPTIONS: readonly {
  value: WorkplaceVisibility;
  label: string;
}[] = [
  { value: "private", label: "No one can see me" },
  { value: "people-nearby", label: "People are nearby" },
  { value: "on-video", label: "I’m on video" },
];
const BREAK_OPTIONS: readonly { value: BreakSpace; label: string }[] = [
  { value: "desk-only", label: "I need to stay at my desk" },
  { value: "room", label: "Around the room or office" },
  { value: "balcony", label: "Onto a balcony" },
  { value: "outside", label: "Outside" },
];
const FORMAT_OPTIONS: readonly {
  value: PreferredActivityFormat;
  label: string;
}[] = [
  { value: "walk", label: "Walking" },
  { value: "stretch", label: "Gentle stretch or yoga" },
  { value: "dance", label: "Dance" },
  { value: "strength", label: "Short strength exercise" },
  { value: "desk", label: "Movement at my desk" },
];

export function OnboardingFlow({
  initialAnswers,
  onComplete,
  onSkip,
}: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>(
    initialAnswers ?? DEFAULT_ANSWERS,
  );

  function toggleFormat(format: PreferredActivityFormat) {
    setAnswers((current) => {
      const selected = current.preferredFormats.includes(format);
      if (!selected && current.preferredFormats.length >= 2) return current;
      return {
        ...current,
        preferredFormats: selected
          ? current.preferredFormats.filter((item) => item !== format)
          : [...current.preferredFormats, format],
      };
    });
  }

  return (
    <section className="onboarding" aria-labelledby="onboarding-heading">
      <div className="onboarding__intro">
        <h2 id="onboarding-heading">Make each suggestion fit where you are.</h2>
        <span>Four quick questions · about one minute · saved only on this device</span>
      </div>

      <div className="onboarding__form">
        <div className="onboarding__progress" aria-label={`Question ${step + 1} of 4`}>
          <span>Question {step + 1} of 4</span>
          <div aria-hidden="true">
            {[0, 1, 2, 3].map((item) => (
              <i className={item <= step ? "is-active" : ""} key={item} />
            ))}
          </div>
        </div>

        {step === 0 ? (
          <fieldset>
            <legend>Where are you right now?</legend>
            <div className="onboarding__choices">
              {PLACE_OPTIONS.map((option) => (
                <label key={option.value}>
                  <input
                    checked={answers.workplace === option.value}
                    name="workplace"
                    onChange={() =>
                      setAnswers({ ...answers, workplace: option.value })
                    }
                    type="radio"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        {step === 1 ? (
          <fieldset>
            <legend>Can colleagues see you?</legend>
            <div className="onboarding__choices">
              {VISIBILITY_OPTIONS.map((option) => (
                <label key={option.value}>
                  <input
                    checked={answers.visibility === option.value}
                    name="visibility"
                    onChange={() =>
                      setAnswers({ ...answers, visibility: option.value })
                    }
                    type="radio"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        {step === 2 ? (
          <fieldset>
            <legend>Where can you go for a 1–5 minute break?</legend>
            <div className="onboarding__choices onboarding__choices--two">
              {BREAK_OPTIONS.map((option) => (
                <label key={option.value}>
                  <input
                    checked={answers.breakSpace === option.value}
                    name="break-space"
                    onChange={() =>
                      setAnswers({ ...answers, breakSpace: option.value })
                    }
                    type="radio"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            <label className="onboarding__check">
              <input
                checked={answers.hasDistantView}
                onChange={(event) =>
                  setAnswers({ ...answers, hasDistantView: event.target.checked })
                }
                type="checkbox"
              />
              <span>I have a window with a distant view</span>
            </label>
          </fieldset>
        ) : null}

        {step === 3 ? (
          <fieldset>
            <legend>What kind of break sounds good?</legend>
            <p className="onboarding__hint">Choose up to two. You can change this later.</p>
            <div className="onboarding__choices onboarding__choices--two">
              {FORMAT_OPTIONS.map((option) => (
                <label key={option.value}>
                  <input
                    checked={answers.preferredFormats.includes(option.value)}
                    disabled={
                      answers.preferredFormats.length >= 2 &&
                      !answers.preferredFormats.includes(option.value)
                    }
                    onChange={() => toggleFormat(option.value)}
                    type="checkbox"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            <label className="onboarding__check">
              <input
                checked={answers.avoidJumpsOrFloor}
                onChange={(event) =>
                  setAnswers({
                    ...answers,
                    avoidJumpsOrFloor: event.target.checked,
                  })
                }
                type="checkbox"
              />
              <span>Don’t suggest jumping or floor exercises</span>
            </label>
          </fieldset>
        ) : null}

        <div className="onboarding__actions">
          <button className="button onboarding__skip" onClick={onSkip} type="button">
            Skip for now
          </button>
          <div>
            {step > 0 ? (
              <button
                className="button onboarding__back"
                onClick={() => setStep((current) => current - 1)}
                type="button"
              >
                Back
              </button>
            ) : null}
            <button
              className="button button--primary"
              disabled={step === 3 && answers.preferredFormats.length === 0}
              onClick={() =>
                step === 3
                  ? onComplete(answers)
                  : setStep((current) => current + 1)
              }
              type="button"
            >
              {step === 3 ? "Save my setup" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
