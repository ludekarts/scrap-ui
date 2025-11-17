import MultiCombobox from "./MultiCombobox";
export type Fruit = {
  id: string;
  name: string;
  icon: string;
};

const initFruits: Fruit[] = [
  { id: "1", name: "Apple", icon: "🍎" },
  { id: "2", name: "Banana", icon: "🍌" },
  { id: "3", name: "Cherry", icon: "🍒" },
  { id: "4", name: "Coconut", icon: "🥥" },
  { id: "5", name: "Watermelon", icon: "🍉" },
  { id: "6", name: "Orange", icon: "🍊" },
  { id: "7", name: "Grape", icon: "🍇" },
  { id: "8", name: "Strawberry", icon: "🍓" },
];

export default function ComboboxSection() {
  const collectFormData = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log("Form Data Submitted: ", data);
  };

  return (
    <div>
      <p className="text-frame">
        This components allow you to create various types of comboboxes with
        ease. A combobox is a combination of a dropdown list and an input field
        that allows users to select an option from a predefined list or enter
        their own value. It enhances user experience by providing suggestions as
        users type, making it easier to find and select options quickly.
      </p>

      <div className="columns-2">
        <div className="scrap-frame">
          <h3>
            <strong>Props</strong>
          </h3>
          <ul>
            <li>
              <code>id?</code>
              <span> string</span>
            </li>
            <li>
              <code>name</code>
              <span> string</span>
            </li>
            <li>
              <code>label?</code>
              <span> string</span>
            </li>
            <li>
              <code>required?</code>
              <span> boolean</span>
            </li>
            <li>
              <code>submitValue?</code>
              <span> string</span>
            </li>
            <li>
              <code>selectedValue?</code>
              <span> string</span>
            </li>
            <li>
              <code>children?</code>
              <span> React.ReactNode</span>
            </li>
            <li>
              <code>onOptionSelected?</code>
              <span>
                (value: ComboboxSlection, isEmptyOption: boolean) void
              </span>
            </li>
          </ul>
        </div>

        <div className="scrap-frame">
          <h3>
            <strong>Anatomy</strong>
          </h3>
        </div>
        <div className="examplebox --expand flex items-center justify-center">
          <div className="gap- flex">
            <form onSubmit={collectFormData}>
              <MultiCombobox
                required
                label="Select your favorite fruits"
                name="best-fruits"
                source={initFruits.map((f) => f.name)}
              />
              <button type="submit">Submit</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
