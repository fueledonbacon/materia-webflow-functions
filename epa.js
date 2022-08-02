const arr = [
    [
      {
        "trait_type": "Capsule",
        "value": "Brand Activations"
      },
      {
        "trait_type": "STATUS",
        "value": "Redeemed"
      }
    ],
    [
      {
        "trait_type": "Capsule",
        "value": "Brand Activations"
      },
      {
        "trait_type": "STATUS",
        "value": "Unredeemed"
      }
    ],
    [
      {
        "trait_type": "Capsule",
        "value": "Brand Activations"
      },
      {
        "trait_type": "STATUS",
        "value": "Unredeemed"
      }
    ],
    [
      {
        "trait_type": "Capsule",
        "value": "Brand Activations"
      },
      {
        "trait_type": "STATUS",
        "value": "Unredeemed"
      }
    ],
    [
      {
        "trait_type": "Capsule",
        "value": "Brand Activations"
      },
      {
        "trait_type": "STATUS",
        "value": "Unredeemed"
      }
    ],
    [
      {
        "trait_type": "Capsule",
        "value": "Brand Activations"
      },
      {
        "trait_type": "STATUS",
        "value": "Unredeemed"
      }
    ],
    [
      {
        "trait_type": "Capsule",
        "value": "Brand Activations"
      },
      {
        "trait_type": "STATUS",
        "value": "Redeemed"
      }
    ],
    [
      {
        "trait_type": "Capsule",
        "value": "Brand Activations"
      },
      {
        "trait_type": "STATUS",
        "value": "Unredeemed"
      }
    ],
    [
      {
        "trait_type": "Capsule",
        "value": "Brand Activations"
      },
      {
        "trait_type": "STATUS",
        "value": "Unredeemed"
      }
    ],
    [
      {
        "trait_type": "Capsule",
        "value": "Brand Activations"
      },
      {
        "trait_type": "STATUS",
        "value": "Redeemed"
      }
    ],
    [
      {
        "trait_type": "Capsule",
        "value": "Brand Activations"
      },
      {
        "trait_type": "STATUS",
        "value": "Unredeemed"
      }
    ],
    [
      {
        "trait_type": "Capsule",
        "value": "Brand Activations"
      },
      {
        "trait_type": "STATUS",
        "value": "Redeemed"
      }
    ],
    [
      {
        "trait_type": "Capsule",
        "value": "Brand Activations"
      },
      {
        "trait_type": "STATUS",
        "value": "Redeemed"
      }
    ],
    [
      {
        "trait_type": "Capsule",
        "value": "Brand Activations"
      },
      {
        "trait_type": "STATUS",
        "value": "Redeemed"
      }
    ],
    [
      {
        "trait_type": "Capsule",
        "value": "Brand Activations"
      },
      {
        "trait_type": "STATUS",
        "value": "Unredeemed"
      }
    ],
    [
      {
        "trait_type": "Capsule",
        "value": "Brand Activations"
      },
      {
        "trait_type": "STATUS",
        "value": "Unredeemed"
      }
    ],
    [
      {
        "trait_type": "Capsule",
        "value": "Brand Activations"
      },
      {
        "trait_type": "STATUS",
        "value": "Redeemed"
      }
    ],
    [
      {
        "trait_type": "Capsule",
        "value": "Brand Activations"
      },
      {
        "trait_type": "STATUS",
        "value": "Unredeemed"
      }
    ],
    [
      {
        "trait_type": "Capsule",
        "value": "Brand Activations"
      },
      {
        "trait_type": "STATUS",
        "value": "Redeemed"
      }
    ],
    [
      {
        "trait_type": "Capsule",
        "value": "Brand Activations"
      },
      {
        "trait_type": "STATUS",
        "value": "Redeemed"
      }
    ],
    [
      {
        "trait_type": "Capsule",
        "value": "Brand Activations"
      },
      {
        "trait_type": "STATUS",
        "value": "Redeemed"
      }
    ],
    [
      {
        "trait_type": "Capsule",
        "value": "Brand Activations"
      },
      {
        "trait_type": "STATUS",
        "value": "Redeemed"
      }
    ],
    [
      {
        "trait_type": "Capsule",
        "value": "Brand Activations"
      },
      {
        "trait_type": "STATUS",
        "value": "Redeemed"
      }
    ],
    [
      {
        "trait_type": "Capsule",
        "value": "Brand Activations"
      },
      {
        "trait_type": "STATUS",
        "value": "Unredeemed"
      }
    ],
    [
      {
        "trait_type": "Capsule",
        "value": "Brand Activations"
      },
      {
        "trait_type": "STATUS",
        "value": "Unredeemed"
      }
    ]
  ]

  let found = []
 arr.map(a => {
    return a.map(i => found.push(i))
 })
 found = found.filter(a => a.trait_type === "STATUS" && a.value === "Redeemed")
 console.log(found)