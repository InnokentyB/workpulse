import type { DemoScenario } from "@/lib/types";

type ScenarioSelectorProps = {
  scenarios: DemoScenario[];
  selectedId: string;
  onSelect: (scenarioId: string) => void;
};

export function ScenarioSelector({
  scenarios,
  selectedId,
  onSelect,
}: ScenarioSelectorProps) {
  return (
    <fieldset className="scenario-selector">
      <legend>Demo scenario</legend>
      <label className="scenario-select-label" htmlFor="scenario-select">
        Choose the workday context
      </label>
      <select
        className="scenario-select"
        id="scenario-select"
        onChange={(event) => onSelect(event.target.value)}
        value={selectedId}
      >
        {scenarios.map((scenario) => (
          <option key={scenario.id} value={scenario.id}>
            {scenario.label}
          </option>
        ))}
      </select>
      <div className="scenario-options">
        {scenarios.map((scenario) => (
          <label
            className="scenario-option"
            data-selected={scenario.id === selectedId}
            key={scenario.id}
          >
            <input
              checked={scenario.id === selectedId}
              name="scenario"
              onChange={() => onSelect(scenario.id)}
              type="radio"
              value={scenario.id}
            />
            <span className="scenario-option__title">{scenario.label}</span>
            <span className="scenario-option__description">
              {scenario.description}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
