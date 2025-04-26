import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { message } from 'antd';

// Common styling configuration
const styles = {
  header: {
    fontSize: 20,
    color: [41, 128, 185], // Professional blue
  },
  subHeader: {
    fontSize: 14,
    color: [52, 73, 94], // Dark gray
  },
  normal: {
    fontSize: 12,
    color: [0, 0, 0],
  },
  table: {
    headerStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontSize: 12,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 10,
    },
    alternateRowStyles: {
      fillColor: [241, 245, 249],
    },
  },
};

// Helper function to format currency
const formatCurrency = (amount) => `Rs ${Number(amount).toFixed(2)}`;

// Helper function to add page header
const addPageHeader = (doc, title, subtitle = null) => {
  doc.setFontSize(styles.header.fontSize);
  doc.setTextColor(styles.header.color[0], styles.header.color[1], styles.header.color[2]);
  doc.text(title, 20, 20);

  if (subtitle) {
    doc.setFontSize(styles.subHeader.fontSize);
    doc.setTextColor(styles.subHeader.color[0], styles.subHeader.color[1], styles.subHeader.color[2]);
    doc.text(subtitle, 20, 30);
  }

  return doc.previousAutoTableHeight + 40;
};

// Helper function to add company info
const addCompanyInfo = (doc, y) => {
  doc.setFontSize(styles.normal.fontSize);
  doc.setTextColor(styles.normal.color[0], styles.normal.color[1], styles.normal.color[2]);
  
  // Add each line of text with proper positioning
  doc.text('Dhananjee Fruit & Sweet Centre', 20, y);
  doc.text('123 Main Street, Colombo', 20, y + 7);
  doc.text('Tel: +94 77 123 4567', 20, y + 14);
  doc.text('Email: info@dhananjee.com', 20, y + 21);
  
  return y + 35;
};

// Generate single order PDF
export const generateOrderPDF = (order) => {
  try {
    const doc = new jsPDF();
    let yPos = 20;

    // Add header
    doc.setFontSize(styles.header.fontSize);
    doc.setTextColor(styles.header.color[0], styles.header.color[1], styles.header.color[2]);
    doc.text('Order Details', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(styles.subHeader.fontSize);
    doc.setTextColor(styles.subHeader.color[0], styles.subHeader.color[1], styles.subHeader.color[2]);
    doc.text(`Order ID: ${order.orderId}`, 20, yPos);
    
    // Add company info
    yPos += 20;
    doc.setFontSize(styles.normal.fontSize);
    doc.setTextColor(0, 0, 0);
    doc.text('Dhananjee Fruit & Sweet Centre', 20, yPos);
    yPos += 7;
    doc.text('123 Main Street, Colombo', 20, yPos);
    yPos += 7;
    doc.text('Tel: +94 77 123 4567', 20, yPos);
    yPos += 7;
    doc.text('Email: info@dhananjee.com', 20, yPos);
    yPos += 15;

    // Order Information
    const orderInfo = [
      ['Order Date:', new Date(order.createdAt).toLocaleString()],
      ['Status:', order.status.toUpperCase()],
      ['Payment Status:', order.paymentStatus.toUpperCase()],
      ['Payment Method:', order.paymentMethod],
      ['Customer Email:', order.customerEmail || 'N/A'],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['', '']],
      body: orderInfo,
      theme: 'plain',
      styles: styles.table.bodyStyles,
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 100 },
      },
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Items Table
    autoTable(doc, {
      startY: yPos,
      head: [['Item', 'Quantity', 'Price', 'Total']],
      body: order.items.map(item => [
        item.name,
        item.quantity,
        formatCurrency(item.price),
        formatCurrency(item.price * item.quantity),
      ]),
      ...styles.table,
    });

    // Total
    const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    yPos = doc.lastAutoTable.finalY + 10;
    
    doc.setFontSize(styles.subHeader.fontSize);
    doc.setTextColor(styles.subHeader.color[0], styles.subHeader.color[1], styles.subHeader.color[2]);
    doc.text(`Total Amount: ${formatCurrency(total)}`, doc.internal.pageSize.width - 20, yPos, { align: 'right' });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for your business!', doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 20, { align: 'center' });

    doc.save(`Order_${order.orderId}.pdf`);
    message.success('PDF generated successfully');
  } catch (error) {
    console.error('PDF Generation Error:', error);
    message.error('Failed to generate PDF');
  }
};

// Generate all orders PDF
export const generateAllOrdersPDF = (orders) => {
  try {
    const doc = new jsPDF();
    let yPos = addPageHeader(doc, 'All Orders Report', `Generated on: ${new Date().toLocaleString()}`);
    yPos = addCompanyInfo(doc, yPos);

    // Summary Statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0), 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;

    const summaryData = [
      ['Total Orders:', totalOrders],
      ['Total Revenue:', formatCurrency(totalRevenue)],
      ['Pending Orders:', pendingOrders],
      ['Completed Orders:', completedOrders],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['', '']],
      body: summaryData,
      theme: 'plain',
      styles: styles.table.bodyStyles,
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 100 },
      },
    });

    // Orders Table
    autoTable(doc, {
      startY: doc.previousAutoTableHeight + yPos + 10,
      head: [['Order ID', 'Date', 'Status', 'Payment', 'Total']],
      body: orders.map(order => [
        order.orderId,
        new Date(order.createdAt).toLocaleDateString(),
        order.status.toUpperCase(),
        order.paymentStatus.toUpperCase(),
        formatCurrency(order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)),
      ]),
      ...styles.table,
    });

    // Add page numbers
    addPageNumbers(doc);

    doc.save('All_Orders_Report.pdf');
    message.success('PDF generated successfully');
  } catch (error) {
    console.error('PDF Generation Error:', error);
    message.error('Failed to generate PDF');
  }
};

// Generate product list PDF
export const generateProductListPDF = (products) => {
  try {
    const doc = new jsPDF();
    let yPos = addPageHeader(doc, 'Product List', `Generated on: ${new Date().toLocaleString()}`);
    yPos = addCompanyInfo(doc, yPos);

    // Summary
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    const lowStock = products.filter(product => product.quantity < 10).length;

    const summaryData = [
      ['Total Products:', totalProducts],
      ['Total Value:', formatCurrency(totalValue)],
      ['Low Stock Items:', lowStock],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['', '']],
      body: summaryData,
      theme: 'plain',
      styles: styles.table.bodyStyles,
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 100 },
      },
    });

    // Products Table
    autoTable(doc, {
      startY: doc.previousAutoTableHeight + yPos + 10,
      head: [['Name', 'Category', 'Price', 'Quantity', 'Total Value']],
      body: products.map(product => [
        product.name,
        product.category,
        formatCurrency(product.price),
        product.quantity,
        formatCurrency(product.price * product.quantity),
      ]),
      ...styles.table,
    });

    // Add page numbers
    addPageNumbers(doc);

    doc.save('Product_List.pdf');
    message.success('PDF generated successfully');
  } catch (error) {
    console.error('PDF Generation Error:', error);
    message.error('Failed to generate PDF');
  }
};

const addPageNumbers = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
};