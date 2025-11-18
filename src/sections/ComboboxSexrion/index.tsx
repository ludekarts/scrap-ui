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

      <div className="mt-6 grid grid-cols-2 gap-6">
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

        <div className="col-span-full mt-6 flex flex-col">
          <div className="ml-auto flex gap-2">
            <button>Bearbone</button>
            <button>Multibox</button>
            <button>Validation</button>
          </div>

          <div className="examplebox mt-4 flex items-center justify-center">
            <div className="flex">
              <form onSubmit={collectFormData}>
                <label
                  htmlFor="best-fruits"
                  className="block w-fit rounded-t-md border-b border-gray-200 bg-white px-2 py-1 text-sm"
                >
                  Select your favorite fruits:
                </label>
                <div className="flex items-start rounded-tr-md rounded-b-md border-b-3 border-black bg-white">
                  <MultiCombobox
                    required
                    name="best-fruits"
                    label="Select your favorite fruits"
                    source={initFruits.map((f) => f.name)}
                  />
                  <button
                    type="submit"
                    data-tw="true"
                    className="size-10 cursor-pointer rounded-md hover:bg-gray-200"
                  >
                    💾
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
