document.addEventListener('DOMContentLoaded', () => {
  const createButton = document.getElementById('createButton');

  createButton.addEventListener('click', () => {
    const name = document.getElementById('name').value;
    const description = document.getElementById('descrip').value;
    const image = document.getElementById('img').value;

    // Create an object with the collected data
    const projectData = {
      name,
      description,
      image
    };

    // Save the data locally (you can use localStorage or other methods)
    localStorage.setItem('projectData', JSON.stringify(projectData));

    // Clear input fields after saving
    document.getElementById('name').value = '';
    document.getElementById('descrip').value = '';
    document.getElementById('img').value = '';

    alert('Project data saved locally.');
  });
});

  const countdownElements = document.querySelectorAll('.countdown span[style^="--value"]');

  countdownElements.forEach(element => {
    const randomNumber = Math.floor(Math.random() * 100);
    const sanitizedValue = Math.max(0, Math.min(99, randomNumber));
    element.style.setProperty('--value', sanitizedValue);
  });

  // Khai báo mảng để chứa dữ liệu
var localArray = [];

// Lấy giá trị từ phần tử có id "name"
var nameValue = document.getElementById('name');

// Thêm giá trị vào mảng
localArray.push(nameValue);

// Hiển thị toàn bộ dữ liệu trong mảng
console.log(localArray);
