# 🔌 Widget Integration Guide

To deploy the **SupCrud Support Assistant** on any web platform, follow these simple steps.

### 1. Script Inclusion

Add the following script tag at the very end of your `<body>` section:

```html
<script
  id="supcrud-script"
  src="[https://cdn.supcrud.com/assets/js/widget.js](https://cdn.supcrud.com/assets/js/widget.js)"
  data-workspace="YOUR_WORKSPACE_KEY"
  data-api="http://localhost:3000/api"
  data-color="#4f46e5"
></script>
```

### 2. Configuration Parameters

- data-workspace: Your unique company identifier found in the SupCrud Dashboard.
- data-api: The endpoint of the SupCrud Backend service.
- data-color: Hexadecimal code to customize the widget's primary brand color.

### 3. Verification

Once the script is loaded, a floating action button will appear. Submissions will be automatically routed to your PostgreSQL workspace and stored in the MongoDB ticket collection.
