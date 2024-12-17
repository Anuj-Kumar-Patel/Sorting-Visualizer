const barsContainer = document.getElementById("bars-container");
const randomizeBtn = document.getElementById("randomize");
const sortBtn = document.getElementById("sort");
const algorithmDropdown = document.getElementById("algorithm");
const speedDropdown = document.getElementById("speed");
const sizeSlider = document.getElementById("size");
const barCountDisplay = document.getElementById("barCountDisplay");
const barColorPicker = document.getElementById("barColor");
const compareColorPicker = document.getElementById("compareColor");
const sortedColorPicker = document.getElementById("sortedColor");

let bars = [];
let delay = 100;
let isSorting = false; // To track sorting state
let pauseFlag = false; // To track if sorting is paused
let sortingPromise = null; // Store the promise that controls the pause/resume
let sortingInProgress = false; // Flag to track whether sorting is ongoing

// Generate Bars
function generateBars(size = 20) {
    barsContainer.innerHTML = ""; // Clear previous bars
    bars = [];
    for (let i = 0; i < size; i++) {
        const value = Math.floor(Math.random() * 100) + 10;
        const bar = document.createElement("div");
        bar.classList.add("bar");
        bar.style.height = `${value * 3}px`;
        bar.style.backgroundColor = barColorPicker.value;
        bar.innerText = value;
        barsContainer.appendChild(bar);
        bars.push(bar);
    }
}

// Sorting Algorithm (Bubble Sort as an example)
async function bubbleSort() {
    for (let i = 0; i < bars.length; i++) {
        if (!sortingInProgress) break; // Stop sorting if canceled
        
        for (let j = 0; j < bars.length - i - 1; j++) {
            if (pauseFlag) {
                await pauseSorting(j, j + 1); // Highlight bars while paused
            }
            highlightBars(j, j + 1);
            await sleep(delay);
            if (parseInt(bars[j].innerText) > parseInt(bars[j + 1].innerText)) {
                swap(j, j + 1);
            }
            resetBarColor(j, j + 1);
        }
        bars[bars.length - i - 1].style.backgroundColor = sortedColorPicker.value;
    }
    if (sortingInProgress) {
        randomizeBtn.innerText = "Randomize Array"; // Reset button text after sorting
    }
    isSorting = false;
    sortingInProgress = false; // Reset sorting state
    sortBtn.innerText = "Sort"; // Change button text back to "Sort"
    resetButtonColors(); // Reset button colors after sorting
}


// Selection Sort

async function selectionSort() {
    for (let i = 0; i < bars.length; i++) {
      if (!sortingInProgress) break;
      let minIndex = i;
      for (let j = i + 1; j < bars.length; j++) {
        if (pauseFlag) {
          await pauseSorting(minIndex, j);
        }
        highlightBars(minIndex, j);
        await sleep(delay);
        if (parseInt(bars[j].innerText) < parseInt(bars[minIndex].innerText)) {
          minIndex = j;
        }
        resetBarColor(minIndex, j);
      }
      swap(minIndex, i);
      bars[i].style.backgroundColor = sortedColorPicker.value;
    }
    if (sortingInProgress) {
      randomizeBtn.innerText = "Randomize Array";
    }
    isSorting = false;
    sortingInProgress = false;
    sortBtn.innerText = "Sort";
    resetButtonColors();
  }
  

  // Insertion Sort

  async function insertionSort() {
    for (let i = 1; i < bars.length; i++) {
        if (!sortingInProgress) break;
        let key = parseInt(bars[i].innerText);
        let j = i - 1;

        while (j >= 0 && parseInt(bars[j].innerText) > key) {
            if (pauseFlag) {
                await pauseSorting(j, j + 1);
            }
            highlightBars(j, j + 1);
            await sleep(delay);
            swap(j + 1, j);
            resetBarColor(j, j + 1);
            j--;
        }
    }

    // After sorting, set all bars to sorted color
    for (let i = 0; i < bars.length; i++) {
        bars[i].style.backgroundColor = sortedColorPicker.value;
    }

    if (sortingInProgress) {
        randomizeBtn.innerText = "Randomize Array";
    }
    isSorting = false;
    sortingInProgress = false;
    sortBtn.innerText = "Sort";
    resetButtonColors();
}



//  Quick Sort

async function quickSort() {
    await quickSortHelper(0, bars.length - 1);

    // After sorting, set all bars to the sorted color
    for (let i = 0; i < bars.length; i++) {
        bars[i].style.backgroundColor = sortedColorPicker.value;
    }

    // Reset states after sorting
    isSorting = false;
    sortingInProgress = false;
    randomizeBtn.innerText = "Randomize Array";
    sortBtn.innerText = "Sort";
    resetButtonColors();
}

async function quickSortHelper(low, high) {
    if (low < high && sortingInProgress) {
        let pivotIndex = await partition(low, high);
        await quickSortHelper(low, pivotIndex - 1); // Sort left partition
        await quickSortHelper(pivotIndex + 1, high); // Sort right partition
    }
}

async function partition(low, high) {
    let pivot = parseInt(bars[high].innerText);
    bars[high].style.backgroundColor = compareColorPicker.value; // Highlight pivot
    let i = low - 1;

    for (let j = low; j < high; j++) {
        if (!sortingInProgress) return; // Stop if canceled
        if (pauseFlag) {
            await pauseSorting(j, high);
        }

        highlightBars(j, high);
        await sleep(delay);

        if (parseInt(bars[j].innerText) < pivot) {
            i++;
            swap(i, j);
            bars[i].style.backgroundColor = "yellow"; // Highlight bars being swapped
            bars[j].style.backgroundColor = barColorPicker.value; // Reset bar color
            await sleep(delay);
        }
        resetBarColor(j, high);
    }

    swap(i + 1, high); // Place pivot in correct position
    bars[i + 1].style.backgroundColor = sortedColorPicker.value; // Mark pivot as sorted
    await sleep(delay);

    // Reset colors for remaining unsorted bars
    for (let k = low; k <= high; k++) {
        if (k !== i + 1) {
            bars[k].style.backgroundColor = barColorPicker.value;
        }
    }
    return i + 1; // Return pivot index
}




//Merge Sort

// Merge Sort
async function mergeSort() {
    await mergeSortHelper(0, bars.length - 1);

    // After sorting, set all bars to the sorted color
    if (sortingInProgress) {
        for (let i = 0; i < bars.length; i++) {
            bars[i].style.backgroundColor = sortedColorPicker.value;
        }
        randomizeBtn.innerText = "Randomize Array";
    }

    // Reset states after sorting
    isSorting = false;
    sortingInProgress = false;
    sortBtn.innerText = "Sort";
    resetButtonColors();
}

// Merge Sort Helper Function
async function mergeSortHelper(start, end) {
    if (start >= end || !sortingInProgress) return; // Base case

    const mid = Math.floor((start + end) / 2);

    // Recursively sort left and right halves
    await mergeSortHelper(start, mid);
    await mergeSortHelper(mid + 1, end);

    // Merge the sorted halves
    await merge(start, mid, end);
}

// Merge Function
async function merge(start, mid, end) {
    const tempArray = [];
    let i = start, j = mid + 1;

    // Merge two sorted halves into a temporary array
    while (i <= mid && j <= end) {
        if (!sortingInProgress) return; // Stop if canceled
        if (pauseFlag) await pauseSorting(i, j); // Pause functionality

        // Highlight bars being compared
        highlightBars(i, j);
        await sleep(delay);

        if (parseInt(bars[i].innerText) <= parseInt(bars[j].innerText)) {
            tempArray.push(parseInt(bars[i].innerText));
            resetBarColor(i, j); // Reset bar color after comparison
            i++;
        } else {
            tempArray.push(parseInt(bars[j].innerText));
            resetBarColor(i, j);
            j++;
        }
    }

    // Copy remaining elements from the left half
    while (i <= mid) {
        if (!sortingInProgress) return;
        if (pauseFlag) await pauseSorting(i, i);

        highlightBars(i, i);
        await sleep(delay);
        tempArray.push(parseInt(bars[i].innerText));
        resetBarColor(i, i);
        i++;
    }

    // Copy remaining elements from the right half
    while (j <= end) {
        if (!sortingInProgress) return;
        if (pauseFlag) await pauseSorting(j, j);

        highlightBars(j, j);
        await sleep(delay);
        tempArray.push(parseInt(bars[j].innerText));
        resetBarColor(j, j);
        j++;
    }

    // Copy the sorted temporary array back to the original bars
    for (let k = start, idx = 0; k <= end; k++, idx++) {
        if (!sortingInProgress) return;
        if (pauseFlag) await pauseSorting(k, k);

        bars[k].style.height = `${tempArray[idx] * 3}px`;
        bars[k].innerText = tempArray[idx];
        bars[k].style.backgroundColor = "yellow"; // Highlight as being updated
        await sleep(delay);

        bars[k].style.backgroundColor = barColorPicker.value; // Reset bar color
    }
}

  



  






// Pause sorting function with highlighting
function pauseSorting(a, b) {
    return new Promise(resolve => {
        // Highlight bars when paused
        bars[a].style.backgroundColor = compareColorPicker.value;
        bars[b].style.backgroundColor = compareColorPicker.value;
        sortingPromise = resolve; // Hold the promise until resumed
    });
}

// Swap function
function swap(a, b) {
    let tempHeight = bars[a].style.height;
    let tempText = bars[a].innerText;
    bars[a].style.height = bars[b].style.height;
    bars[a].innerText = bars[b].innerText;
    bars[b].style.height = tempHeight;
    bars[b].innerText = tempText;
}

// Highlight Bars during comparison
function highlightBars(a, b) {
    bars[a].style.backgroundColor = compareColorPicker.value;
    bars[b].style.backgroundColor = compareColorPicker.value;
}

// Reset Bar Color after comparison
function resetBarColor(a, b) {
    bars[a].style.backgroundColor = barColorPicker.value;
    bars[b].style.backgroundColor = barColorPicker.value;
}

// Sleep function for delays
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Event Listener for Randomize Button
randomizeBtn.addEventListener("click", () => {
    if (isSorting) {
        pauseFlag = !pauseFlag;
        randomizeBtn.innerText = pauseFlag ? "Resume" : "Pause"; // Toggle between Pause and Resume
        // Change color based on the state
        randomizeBtn.style.backgroundColor = pauseFlag ? "#28a745" : "#42a5f5"; // Green for Resume, Red for Pause
        if (!pauseFlag && sortingPromise) {
            sortingPromise(); // Resume sorting by resolving the promise
        }
    } else {
        generateBars(parseInt(sizeSlider.value)); // Generate new bars when sorting is not in progress
    }
});

// Event Listener for Sort/Cancel Button
sortBtn.addEventListener("click", () => {
    if (isSorting) {
        cancelSorting(); // Cancel sorting if in progress
    } else {
        startSorting(); // Start sorting process if not already sorting
    }
});

// Start Sorting Process
function startSorting() {
    delay = parseInt(speedDropdown.value);
    const algorithm = algorithmDropdown.value;
    isSorting = true;
    sortingInProgress = true;
    randomizeBtn.innerText = "Pause"; // Change randomize button to "Pause"
    randomizeBtn.style.backgroundColor = "#42a5f5"; // Red for pause option
    sortBtn.innerText = "Cancel"; // Change sort button to "Cancel"
    sortBtn.style.backgroundColor = "#e74c3c"; // Red for cancel option
    pauseFlag = false; // Ensure sorting starts immediately

    if (algorithm === "bubble") bubbleSort();
    else if (algorithm === "selection") selectionSort();
    else if (algorithm === "insertion") insertionSort();
    else if (algorithm === "quick") quickSort();
    else if (algorithm === "merge") mergeSort();
    else alert("Algorithm not implemented yet.");
}

// Cancel Sorting Process
function cancelSorting() {
    sortingInProgress = false; // Set flag to false to stop sorting
    isSorting = false;
    pauseFlag = false;
    randomizeBtn.innerText = "Randomize Array"; // Reset randomize button text
    randomizeBtn.style.backgroundColor = "#6c63ff"; // Reset randomize button color to default
    sortBtn.innerText = "Sort"; // Change sort button back to "Sort"
    sortBtn.style.backgroundColor = "#6c63ff"; // Reset sort button color to default
    
    // Reset all bars to initial color
    for (let i = 0; i < bars.length; i++) {
        bars[i].style.backgroundColor = barColorPicker.value; // Reset each bar to the initial color
    }

    // Regenerate bars to their initial state
    setTimeout(() => {
        generateBars(parseInt(sizeSlider.value));
    }, 50); // Delay the regeneration to ensure reset completes before new bars are created
}

// Reset button colors after sorting
function resetButtonColors() {
    randomizeBtn.style.backgroundColor = "#6c63ff"; // Reset randomize button color
    sortBtn.style.backgroundColor = "#6c63ff"; // Reset sort button color
}

// Slider Event Listener to Update Display Value
sizeSlider.addEventListener("input", () => {
    const value = sizeSlider.value;
    barCountDisplay.innerText = value; // Update the displayed value
    generateBars(parseInt(value)); // Regenerate bars
});

// Initial Setup
generateBars();
